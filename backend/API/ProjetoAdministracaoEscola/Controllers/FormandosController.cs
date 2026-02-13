using iText.IO.Image;
using iText.Kernel.Colors;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Borders;
using iText.Layout.Element;
using iText.Layout.Properties; 
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Formando;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FormandosController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public FormandosController(SistemaGestaoContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém a lista de todos os formandos registados no sistema,
        /// incluindo informação básica do utilizador e a turma ativa (caso exista).
        /// </summary>
        /// <returns>
        /// Lista de formandos com dados resumidos.
        /// </returns>
        /// <response code="200">Lista devolvida com sucesso.</response>
        // GET: api/Formandos
        [HttpGet]
        public async Task<ActionResult> GetFormandos()
        {
            var formandos = await _context.Formandos
                .Include(f => f.IdUtilizadorNavigation)
                .Include(f => f.Inscricos)
                    .ThenInclude(i => i.IdTurmaNavigation) // Carrega a Turma através da Inscrição
                .Select(f => new
                {
                    f.IdFormando,
                    f.IdUtilizadorNavigation.Nome,
                    f.IdUtilizadorNavigation.Email,
                    f.IdUtilizadorNavigation.Nif,
                    f.IdUtilizadorNavigation.Telefone,
                    Status = f.IdUtilizadorNavigation.StatusAtivacao,
                    // Procuramos o nome da turma onde a inscrição esteja Ativa
                    TurmaAtiva = f.Inscricos
                        .Where(i => i.Estado == "Ativo")
                        .Select(i => new
                        {
                            i.IdTurmaNavigation.NomeTurma,
                            i.IdTurmaNavigation.DataFim
                        })
                        .FirstOrDefault()
                })
                .OrderBy(f => f.Nome)
                .ToListAsync();

            var resultado = formandos.Select(f => new
            {
                f.IdFormando,
                f.Nome,
                f.Email,
                f.Nif,
                f.Telefone,
                f.Status,
                NomeTurma = f.TurmaAtiva != null ? f.TurmaAtiva.NomeTurma : "Sem Turma",
                DataFim = f.TurmaAtiva != null ? f.TurmaAtiva.DataFim.ToString("dd/MM/yyyy") : "N/A"
            });

            return Ok(resultado);
        }

        /// <summary>
        /// Obtém os dados completos de um formando específico,
        /// incluindo dados pessoais, escolaridade, estado de inscrição e ficheiros associados.
        /// </summary>
        /// <param name="id">Identificador do formando.</param>
        /// <returns>
        /// Dados detalhados do formando.
        /// </returns>
        /// <response code="200">Formando encontrado.</response>
        /// <response code="404">Formando não encontrado.</response>
        // GET: api/Formandos/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("{id}")]
        public async Task<ActionResult> GetFormando(int id)
        {
            var formando = await _context.Formandos
                .Include(f => f.IdUtilizadorNavigation)
                .Include(f => f.IdEscolaridadeNavigation)
                .Include(f => f.Inscricos)
                    .ThenInclude(i => i.IdTurmaNavigation) // Inclui os detalhes da Turma
                .FirstOrDefaultAsync(f => f.IdFormando == id);

            if (formando == null)
                return NotFound(new { message = "Formando não encontrado!" });

            // Identificar a inscrição ativa para extrair os dados da turma
            var inscricao = formando.Inscricos
                .OrderByDescending(i => i.DataInscricao)
                .FirstOrDefault();

            var resposta = new
            {
                formando.IdFormando,
                formando.IdUtilizador,
                formando.IdUtilizadorNavigation.Nome,
                formando.IdUtilizadorNavigation.Nif,
                formando.IdUtilizadorNavigation.DataNascimento,
                formando.IdUtilizadorNavigation.Morada,
                formando.IdUtilizadorNavigation.Telefone,
                formando.IdUtilizadorNavigation.Sexo,
                formando.IdUtilizadorNavigation.Email,
                formando.IdEscolaridade,
                EscolaridadeNivel = formando.IdEscolaridadeNavigation?.Nivel,
                //Estado Inscrição
                Estado = inscricao?.Estado ?? "Suspenso",
                // Dados da Turma
                inscricao?.IdTurma,
                NomeTurma = inscricao?.IdTurmaNavigation?.NomeTurma ?? "Sem Turma",
                // Ficheiros
                Fotografia = formando.Fotografia != null ? $"data:image/jpeg;base64,{Convert.ToBase64String(formando.Fotografia)}" : null,
                AnexoFicheiro = formando.AnexoFicheiro != null ? $"data:application/pdf;base64,{Convert.ToBase64String(formando.AnexoFicheiro)}" : null
            };

            return Ok(resposta);
        }

        /// <summary>
        /// Gera e devolve um ficheiro PDF com a ficha completa do formando,
        /// incluindo dados pessoais, percurso formativo e média final.
        /// </summary>
        /// <param name="id">Identificador do formando.</param>
        /// <returns>
        /// Ficheiro PDF com a ficha do formando.
        /// </returns>
        /// <response code="200">PDF gerado com sucesso.</response>
        /// <response code="404">Formando não encontrado.</response>
        // GET: api/Formandos/5{id}/download-ficha
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("{id}/download-ficha")]
        public async Task<IActionResult> DownloadFicha(int id)
        {
            // Procura o formando e os seus dados
            var formando = await _context.Formandos
                .Include(f => f.IdUtilizadorNavigation)
                .FirstOrDefaultAsync(f => f.IdFormando == id);

            if (formando == null) return NotFound(new { message = "Formando não encontrado." });

            // Histórico de avaliações
            var avaliacoes = await _context.Avaliacoes
                .Include(a => a.IdModuloNavigation)
                .Include(a => a.IdInscricaoNavigation)
                    .ThenInclude(i => i.IdTurmaNavigation)
                        .ThenInclude(t => t.IdCursoNavigation)
                .Where(a => a.IdInscricaoNavigation.IdFormando == id)
                .ToListAsync();

            // Calcular media geral
            double mediaGeral = avaliacoes.Any() ? (double)avaliacoes.Average(a => a.Nota ?? 0) : 0;

            using (var ms = new MemoryStream())
            {
                var writer = new PdfWriter(ms);
                var pdf = new PdfDocument(writer);
                var document = new Document(pdf);

                // --- CONTEÚDO DO PDF ---

                // Cabeçalho:

                Table headerTable = new Table(UnitValue.CreatePercentArray(new float[] { 1, 2, 1 })).UseAllAvailableWidth();
                headerTable.SetMarginBottom(20);

                // LADO ESQUERDO: Logo
                string logoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "logo_hawk.png");
                if (System.IO.File.Exists(logoPath))
                {
                    Image logo = new Image(ImageDataFactory.Create(logoPath)).SetWidth(50);
                    headerTable.AddCell(new Cell().Add(logo).SetBorder(Border.NO_BORDER).SetVerticalAlignment(VerticalAlignment.MIDDLE));
                }
                else { headerTable.AddCell(new Cell().SetBorder(Border.NO_BORDER)); }

                // CENTRO: Nome do Projeto
                headerTable.AddCell(new Cell().Add(new Paragraph("HAWK PORTAL")
                    .SetFontSize(18).SetBold().SetFontColor(new DeviceRgb(0, 80, 80)))
                    .SetBorder(Border.NO_BORDER).SetTextAlignment(TextAlignment.CENTER).SetVerticalAlignment(VerticalAlignment.MIDDLE));

                // LADO DIREITO: Data de Emissão
                headerTable.AddCell(new Cell().Add(new Paragraph($"Emitido em:\n{DateTime.Now:dd/MM/yyyy HH:mm}")
                    .SetFontSize(8).SetItalic().SetTextAlignment(TextAlignment.RIGHT))
                    .SetBorder(Border.NO_BORDER).SetVerticalAlignment(VerticalAlignment.BOTTOM));

                document.Add(headerTable);

                // Tabela de 2 colunas para o perfil do formando
                // Coluna 1: Dados | Coluna 2: Foto
                Table perfilTable = new Table(UnitValue.CreatePercentArray(new float[] { 70, 30 })).UseAllAvailableWidth();
                perfilTable.SetBorder(Border.NO_BORDER).SetMarginBottom(20);

                // --- COLUNA DA ESQUERDA: DADOS ---
                Cell dadosCell = new Cell().SetBorder(Border.NO_BORDER);
                dadosCell.Add(new Paragraph("FICHA DE REGISTO").SetFontSize(16).SetBold().SetUnderline());
                dadosCell.Add(new Paragraph($"\nNome: {formando.IdUtilizadorNavigation.Nome}"));
                dadosCell.Add(new Paragraph($"E-mail: {formando.IdUtilizadorNavigation.Email}"));
                dadosCell.Add(new Paragraph($"NIF: {formando.IdUtilizadorNavigation.Nif}"));
                perfilTable.AddCell(dadosCell);

                // --- COLUNA DA DIREITA: FOTO ---
                Cell fotoCell = new Cell().SetBorder(Border.NO_BORDER).SetHorizontalAlignment(HorizontalAlignment.RIGHT);
                if (formando.Fotografia != null && formando.Fotografia.Length > 0)
                {
                    Image img = new Image(ImageDataFactory.Create(formando.Fotografia)).SetMaxHeight(100).SetHorizontalAlignment(HorizontalAlignment.RIGHT);

                    fotoCell.Add(img);
                }
                else
                {
                    fotoCell.Add(new Paragraph("[Sem Foto]").SetItalic().SetFontSize(10).SetTextAlignment(TextAlignment.RIGHT));
                }
                perfilTable.AddCell(fotoCell);

                // Adicionar a tabela de perfil ao documento
                document.Add(perfilTable);

                // Espaçamento antes da tabela de notas
                document.Add(new Paragraph("\n"));

                // --- Tabela de Notas ---
                document.Add(new Paragraph("PERCURSO FORMATIVO").SetBold().SetMarginBottom(5));

                Table table = new Table(UnitValue.CreatePercentArray(new float[] { 5, 2, 2 })).UseAllAvailableWidth();

                // Cabeçalhos com cor de fundo
                Cell header1 = new Cell().Add(new Paragraph("Curso / Módulo").SetBold().SetFontColor(DeviceRgb.WHITE));
                Cell header2 = new Cell().Add(new Paragraph("Data").SetBold().SetFontColor(DeviceRgb.WHITE));
                Cell header3 = new Cell().Add(new Paragraph("Nota").SetBold().SetFontColor(DeviceRgb.WHITE));

                header1.SetBackgroundColor(new DeviceRgb(0, 80, 80));
                header2.SetBackgroundColor(new DeviceRgb(0, 80, 80));
                header3.SetBackgroundColor(new DeviceRgb(0, 80, 80));

                table.AddHeaderCell(header1);
                table.AddHeaderCell(header2);
                table.AddHeaderCell(header3);

                foreach (var av in avaliacoes)
                {
                    table.AddCell($"{av.IdInscricaoNavigation.IdTurmaNavigation.IdCursoNavigation.Nome} - {av.IdModuloNavigation.Nome}");
                    table.AddCell(av.DataAvaliacao?.ToString("dd/MM/yyyy") ?? "-");
                    table.AddCell(av.Nota?.ToString("0.00") ?? "N/A");
                }

                document.Add(table);

                // --- Media Geral ---
                document.Add(new Paragraph($"\nMÉDIA GERAL DO CURSO: {mediaGeral:F2}")
                    .SetFontSize(14)
                    .SetBold()
                    .SetTextAlignment(TextAlignment.RIGHT)
                    .SetFontColor(mediaGeral >= 9.5 ? new DeviceRgb(0, 100, 0) : new DeviceRgb(150, 0, 0)));

                document.Close();

                // --- retorno do ficheiro ---
                byte[] fileBytes = ms.ToArray();
                return File(fileBytes, "application/pdf", $"Ficha_{formando.IdUtilizadorNavigation.Nome}.pdf");
            }
        }

        /// <summary>
        /// Cria um novo perfil completo de formando.
        /// Caso o utilizador ainda não exista, é criado automaticamente.
        /// Permite associar inscrição numa turma e anexar ficheiros.
        /// </summary>
        /// <param name="dto">Dados completos do formando.</param>
        /// <returns>
        /// Resultado da operação de criação.
        /// </returns>
        /// <response code="200">Formando criado com sucesso.</response>
        /// <response code="400">Erro de validação ou dados inválidos.</response>
        /// <response code="409">Email ou NIF já registado.</response>
        // POST: api/Formandos/completo
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPost("completo")]
        public async Task<IActionResult> CreateFormando([FromForm] FormandoCompletoDTO dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var utilizadorExistente = await _context.Utilizadores.FirstOrDefaultAsync(u => u.Email == dto.Email);
                int userId;


                if (utilizadorExistente == null)
                {
                    // Validação nif unico
                    if (await _context.Utilizadores.AnyAsync(u => u.Nif == dto.Nif))
                        return Conflict(new { message = "Este NIF já está registado." });

                    // criar utilizador
                    if (string.IsNullOrEmpty(dto.Password))
                        return BadRequest(new { message = "A password é obrigatória para novos utilizadores." });

                    var novoUtilizador = new Utilizador
                    {
                        Nome = dto.Nome,
                        Nif = dto.Nif,
                        Email = dto.Email,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                        DataNascimento = dto.DataNascimento,
                        Morada = dto.Morada,
                        Telefone = dto.Telefone,
                        Sexo = dto.Sexo,
                        IdTipoUtilizador = 3, // Formando
                        StatusAtivacao = true // ativado por defeito
                    };

                    _context.Utilizadores.Add(novoUtilizador);
                    await _context.SaveChangesAsync();
                    userId = novoUtilizador.IdUtilizador;
                }
                else
                {

                    // Verificar se ele já tem perfil de formador
                    if (await _context.Formadores.AnyAsync(f => f.IdUtilizador == utilizadorExistente.IdUtilizador))
                        return Conflict(new { message = "Este utilizador já tem um perfil de formador ativo, por favor altere o tipo de utilizador na tab utilizador!" });

                    // Verificar se ele já tem perfil de formando
                    if (await _context.Formandos.AnyAsync(f => f.IdUtilizador == utilizadorExistente.IdUtilizador))
                        return Conflict(new { message = "Este utilizador já tem um perfil de formando ativo." });

                    // Alteramos os dados se necessario (ou colocamos os que vao preencher automaticamente os campos)
                    utilizadorExistente.Nome = dto.Nome;
                    utilizadorExistente.Nif = dto.Nif;
                    utilizadorExistente.Telefone = dto.Telefone;
                    utilizadorExistente.DataNascimento = dto.DataNascimento;
                    utilizadorExistente.Morada = dto.Morada;
                    utilizadorExistente.Telefone = dto.Telefone;
                    utilizadorExistente.Sexo = dto.Sexo;
                    utilizadorExistente.IdTipoUtilizador = 3; // Formando
                    // Não trocamos a password e email


                    userId = utilizadorExistente.IdUtilizador;
                }

                // Criar Perfil de formando vinculado ao userId
                var novoFormando = new Formando
                {
                    IdUtilizador = userId,
                    IdEscolaridade = dto.IdEscolaridade,
                };

                // Tratamento de Ficheiros
                if (dto.Fotografia != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Fotografia.CopyToAsync(ms);
                    novoFormando.Fotografia = ms.ToArray();
                }

                if (dto.Documento != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Documento.CopyToAsync(ms);
                    novoFormando.AnexoFicheiro = ms.ToArray();
                }

                // adicionar o formando ao contexto para gerar o IdFormando necessário para a inscrição
                _context.Formandos.Add(novoFormando);

                // Inscrição em Turma
                if (dto.IdTurma.HasValue && dto.IdTurma > 0)
                {
                    _context.Inscricoes.Add(new Inscrico
                    {
                        // EM VEZ DE: IdFormando = novoFormando.IdFormando (que é 0) usar a navegação
                        IdFormandoNavigation = novoFormando,

                        IdTurma = dto.IdTurma.Value,
                        DataInscricao = DateOnly.FromDateTime(DateTime.Now),
                        Estado = "Ativo"
                    });
                    await _context.SaveChangesAsync();
                }

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return Ok(new { message = "Formador registado com sucesso!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = "Erro no registo: " + ex.Message });
            }
        }

        /// <summary>
        /// Atualiza os dados de um formando existente,
        /// incluindo dados pessoais, escolaridade, ficheiros e estado de inscrição.
        /// </summary>
        /// <param name="id">Identificador do formando.</param>
        /// <param name="dto">Dados atualizados do formando.</param>
        /// <returns>
        /// Resultado da operação de atualização.
        /// </returns>
        /// <response code="200">Atualização realizada com sucesso.</response>
        /// <response code="400">Dados inválidos.</response>
        /// <response code="404">Formando não encontrado.</response>
        /// <response code="409">NIF já pertence a outro utilizador.</response>
        // PUT: api/Formandos/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFormando(int id, [FromForm] FormandoCompletoDTO dto)
        {
            var formando = await _context.Formandos
                .Include(f => f.IdUtilizadorNavigation)
                .FirstOrDefaultAsync(f => f.IdFormando == id);

            if (formando == null) return NotFound();

            // Validar NIF noutros utilizadores
            bool nifEmUso = await _context.Utilizadores.AnyAsync(u => u.Nif == dto.Nif && u.IdUtilizador != formando.IdUtilizador);
            if (nifEmUso) return Conflict(new { message = "O NIF já pertence a outro utilizador." });

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Atualizar Utilizador
                var u = formando.IdUtilizadorNavigation;
                u.Nome = dto.Nome;
                u.Nif = dto.Nif;
                u.Telefone = dto.Telefone;
                u.Morada = dto.Morada;
                u.DataNascimento = dto.DataNascimento;
                u.Sexo = dto.Sexo;

                // Atualizar Formando
                formando.IdEscolaridade = dto.IdEscolaridade;

                if (dto.Fotografia != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Fotografia.CopyToAsync(ms);
                    formando.Fotografia = ms.ToArray();
                }

                if (dto.Documento != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Documento.CopyToAsync(ms);
                    formando.AnexoFicheiro = ms.ToArray();
                }

                // Gestão de Inscrição
                var inscricao = await _context.Inscricoes
                    .FirstOrDefaultAsync(i => i.IdFormando == id);

                // Se foi atribuída uma turma
                if (dto.IdTurma.HasValue && dto.IdTurma > 0)
                {
                    if (inscricao == null)
                    {
                        // Criar nova inscrição ativa
                        _context.Inscricoes.Add(new Inscrico
                        {
                            IdFormando = id,
                            IdTurma = dto.IdTurma.Value,
                            DataInscricao = DateOnly.FromDateTime(DateTime.Now),
                            Estado = "Ativo"
                        });
                    }
                    else
                    {
                        // Se mudou de turma
                        if (inscricao.IdTurma != dto.IdTurma.Value)
                        {
                            inscricao.IdTurma = dto.IdTurma.Value;
                            inscricao.Estado = "Ativo";
                        }
                        else if (!string.IsNullOrEmpty(dto.Estado))
                        {
                            // Atualiza estado mesmo mantendo a turma
                            inscricao.Estado = dto.Estado;
                        }
                    }
                }
                else
                {
                    // apenas atualizar estado
                    if (inscricao != null && !string.IsNullOrEmpty(dto.Estado))
                    {
                        inscricao.Estado = dto.Estado;
                    }
                }


                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Dados atualizados com sucesso!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = "Erro: " + ex.Message });
            }
        }

        /// <summary>
        /// Inativa (soft delete) um formando do sistema.
        /// A operação falha caso existam aulas futuras associadas à turma onde está inscrito.
        /// </summary>
        /// <param name="id">Identificador do formando.</param>
        /// <returns>
        /// Resultado da operação de remoção.
        /// </returns>
        /// <response code="204">Formando inativado com sucesso.</response>
        /// <response code="400">Existem aulas futuras associadas.</response>
        /// <response code="404">Formando não encontrado.</response>
        // DELETE: api/Formandos/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFormando(int id)
        {
            var formando = await _context.Formandos
                .Include(f => f.IdUtilizadorNavigation)
                .FirstOrDefaultAsync(f => f.IdFormando == id);

            if (formando == null) return NotFound(new { message = "Formando não encontrado." });

            // Verificar se existe alguma inscição associada
            bool temAulasFuturas = await _context.Inscricoes
                .Where(i => i.IdFormando == id) 
                .AnyAsync(i => _context.Horarios.Any(h =>
                    h.IdTurma == i.IdTurma && 
                    h.Data > DateOnly.FromDateTime(DateTime.Now)
                ));

            if (temAulasFuturas)
            {
                return BadRequest(new { message = "Não é possível eliminar o formando pois ele está inscrito numa turma com aulas agendadas para o futuro." });
            }

            // Inativar na tabela de Formandos (soft delete)
            formando.Ativo = false;
            formando.DataDesativacao = DateTime.Now;

            if (formando.IdUtilizadorNavigation != null)
            {
                formando.IdUtilizadorNavigation.Ativo = false;
                formando.IdUtilizadorNavigation.DataDesativacao = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}