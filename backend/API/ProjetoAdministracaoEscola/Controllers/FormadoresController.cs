using iText.IO.Image;
using iText.Kernel.Colors;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using iText.Layout;
using iText.Layout.Borders;
using iText.Layout.Element;
using iText.Layout.Properties;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO;
using ProjetoAdministracaoEscola.ModelsDTO.Formador;
using ProjetoAdministracaoEscola.ModelsDTO.Horario;
using ProjetoAdministracaoEscola.ModelsDTO.TipoMateria;
using System.Security.Claims;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FormadoresController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public FormadoresController(SistemaGestaoContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém a lista de todos os formadores registados no sistema.
        /// </summary>
        /// <remarks>
        /// Devolve informação resumida em formato DTO,
        /// incluindo dados pessoais básicos e qualificações.
        /// </remarks>
        /// <returns>
        /// 200 OK com a lista de formadores.
        /// </returns>
        // GET: api/Formadores
        [Authorize(Policy = "FormadorOuAdminOuAdministrativo")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FormadorDTO>>> GetFormadores()
        {
            var formadores = await _context.Formadores
                .Include(f => f.IdUtilizadorNavigation)
                .Select(f => new FormadorDTO
                {
                    IdFormador = f.IdFormador,
                    Nome = f.IdUtilizadorNavigation.Nome,
                    Email = f.IdUtilizadorNavigation.Email,
                    Nif = f.IdUtilizadorNavigation.Nif,
                    Telefone = f.IdUtilizadorNavigation.Telefone,
                    Qualificacoes = f.Qualificacoes
                })
                .OrderBy(f => f.Nome)
                .ToListAsync();

            return Ok(formadores);
        }

        /// <summary>
        /// Obtém os dados completos de um formador específico.
        /// </summary>
        /// <param name="id">Identificador do formador.</param>
        /// <remarks>
        /// Inclui:
        /// - Dados pessoais;
        /// - Qualificações;
        /// - Fotografia (em Base64);
        /// - Documento PDF (em Base64);
        /// - Tipos de matéria associados.
        /// </remarks>
        /// <returns>
        /// 200 OK com os dados do formador;
        /// 404 NotFound se o formador não existir.
        /// </returns>
        // GET: api/Formadores/5
        //TODO: FALTA  CONFIRMAR AUTHROIZE NESTE
        [HttpGet("{id}")]
        public async Task<ActionResult<FormadorCompletoDTO>> GetFormador(int id)
        {
            var formador = await _context.Formadores
                .Include(f => f.IdUtilizadorNavigation)
                .Include(f => f.FormadoresTipoMaterias)
                    .ThenInclude(ft => ft.TipoMateria)
                .FirstOrDefaultAsync(f => f.IdFormador == id);

            if (formador == null)
                return NotFound(new { message = "Formador não encontrado." });

            var resposta = new FormadorCompletoDTO
            {
                IdFormador = formador.IdFormador,
                IdUtilizador = formador.IdUtilizador,
                Iban = formador.Iban,
                Qualificacoes = formador.Qualificacoes,
                Nome = formador.IdUtilizadorNavigation.Nome,
                Nif = formador.IdUtilizadorNavigation.Nif,
                DataNascimento = formador.IdUtilizadorNavigation.DataNascimento,
                Morada = formador.IdUtilizadorNavigation.Morada,
                Telefone = formador.IdUtilizadorNavigation.Telefone,
                Sexo = formador.IdUtilizadorNavigation.Sexo,
                Email = formador.IdUtilizadorNavigation.Email,

                Fotografia = formador.Fotografia != null
                    ? $"data:image/jpeg;base64,{Convert.ToBase64String(formador.Fotografia)}"
                    : null,

                AnexoFicheiro = formador.AnexoFicheiro != null
                    ? $"data:application/pdf;base64,{Convert.ToBase64String(formador.AnexoFicheiro)}"
                    : null,


                TiposMateria = formador.FormadoresTipoMaterias
                    .Select(tm => new TipoMateriaDTO
                    {
                        IdTipoMateria = tm.IdTipoMateria,
                        Tipo = tm.TipoMateria.Tipo
                    })
                    .ToList()
            };
            return Ok(resposta);
        }

        /// <summary>
        /// Obtém todos os tipos de matéria disponíveis no sistema.
        /// </summary>
        /// <returns>
        /// 200 OK com a lista de tipos de matéria.
        /// </returns>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("tiposmateria")]
        public async Task<IActionResult> GetTiposMateria()
        {
            var tiposMateria = await _context.TipoMaterias.ToListAsync();

            return Ok(tiposMateria);
        }

        /// <summary>
        /// Gera e descarrega a ficha de registo do formador em formato PDF.
        /// </summary>
        /// <param name="id">Id do formador.</param>
        /// <remarks>
        /// O documento PDF inclui:
        /// - Informação pessoal do formador;
        /// - Fotografia (se existente);
        /// - Histórico de módulos lecionados agrupados por curso e turma;
        /// - Numeração de páginas.
        /// </remarks>
        /// <returns>
        /// Ficheiro PDF gerado dinamicamente;
        /// 404 NotFound se o formador não existir.
        /// </returns>
        // GET: api/Formadores/5{id}/download-ficha
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("{id}/download-ficha")]
        public async Task<IActionResult> DownloadFicha(int id)
        {
            // Procura o formando e os seus dados
            var formador = await _context.Formadores
                .Include(f => f.IdUtilizadorNavigation)
                .FirstOrDefaultAsync(f => f.IdFormador == id);

            if (formador == null) return NotFound(new { message = "Formador não encontrado." });

            var horarios = await _context.Horarios
                .Where(h => h.IdFormador == id)
                .Include(h => h.IdCursoModuloNavigation)
                    .ThenInclude(cm => cm.IdCursoNavigation)
                .Include(h => h.IdCursoModuloNavigation)
                    .ThenInclude(cm => cm.IdModuloNavigation)
                .Include(h => h.IdTurmaNavigation)
                .ToListAsync();

            var modulosLecionados = horarios
                .GroupBy(h => new { h.IdCursoModulo, h.IdTurma })
                .Select(g => g.First())
                .ToList();

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
                string logoPath = System.IO.Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "logo_hawk.png");
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
                dadosCell.Add(new Paragraph($"\nNome: {formador.IdUtilizadorNavigation.Nome}"));
                dadosCell.Add(new Paragraph($"E-mail: {formador.IdUtilizadorNavigation.Email}"));
                dadosCell.Add(new Paragraph($"NIF: {formador.IdUtilizadorNavigation.Nif}"));
                dadosCell.Add(new Paragraph($"IBAN: {formador.Iban}" ?? "'Não registado'"));
                perfilTable.AddCell(dadosCell);

                // --- COLUNA DA DIREITA: FOTO ---
                Cell fotoCell = new Cell().SetBorder(Border.NO_BORDER).SetHorizontalAlignment(HorizontalAlignment.RIGHT);
                if (formador.Fotografia != null && formador.Fotografia.Length > 0)
                {
                    Image img = new Image(ImageDataFactory.Create(formador.Fotografia)).SetMaxHeight(100).SetHorizontalAlignment(HorizontalAlignment.RIGHT);

                    fotoCell.Add(img);
                }
                else
                {
                    fotoCell.Add(new Paragraph("[Sem Foto]").SetItalic().SetFontSize(10).SetTextAlignment(TextAlignment.RIGHT));
                }
                perfilTable.AddCell(fotoCell);

                // Adicionar a tabela de perfil ao documento
                document.Add(perfilTable);

                // Espaçamento antes da tabela de modulos
                document.Add(new Paragraph("\n"));


                // --- Tabela de Módulos Lecionados ---
                document.Add(new Paragraph("Histórico de Módulos por Turma")
                    .SetBold()
                    .SetMarginBottom(10)
                    .SetFontSize(14));

                Table table = new Table(UnitValue.CreatePercentArray(new float[] { 7, 2 })).UseAllAvailableWidth();

                // Cabeçalhos principais
                Cell h1 = new Cell().Add(new Paragraph("Módulo").SetBold().SetFontColor(DeviceRgb.WHITE)).SetBackgroundColor(new DeviceRgb(0, 80, 80)).SetPaddingLeft(5).SetPaddingBottom(2).SetPaddingTop(2).SetFontSize(13);
                Cell h2 = new Cell().Add(new Paragraph("Carga Horária").SetBold().SetFontColor(DeviceRgb.WHITE)).SetBackgroundColor(new DeviceRgb(0, 80, 80)).SetPaddingLeft(20).SetFontSize(13);

                table.AddHeaderCell(h1);
                table.AddHeaderCell(h2);

                // Agrupar os dados pelo Nome do Curso
                var gruposPorCurso = modulosLecionados
                    .GroupBy(m => new
                    {
                        NomeCurso = m.IdCursoModuloNavigation.IdCursoNavigation.Nome,
                        NomeTurma = m.IdTurmaNavigation.NomeTurma
                    })
                    .OrderBy(g => g.Key.NomeCurso)
                    .ThenBy(g => g.Key.NomeTurma);

                foreach (var grupo in gruposPorCurso)
                {
                    // Adicionar uma linha de sub-cabeçalho para o CURSO (ocupa as 2 colunas)
                    Cell cursoHeader = new Cell(1, 2)
                        .Add(new Paragraph($"CURSO: {grupo.Key.NomeCurso} | TURMA: {grupo.Key.NomeTurma}").SetBold())
                        .SetBackgroundColor(new DeviceRgb(240, 240, 240)) // Cinza claro para destaque
                        .SetPaddingLeft(10)
                        .SetPaddingTop(5)
                        .SetPaddingBottom(5);

                    table.AddCell(cursoHeader);

                    // Listar os Módulos deste curso específico
                    foreach (var cm in grupo)
                    {
                        var moduloNome = cm.IdCursoModuloNavigation.IdModuloNavigation.Nome;
                        var horas = cm.IdCursoModuloNavigation.IdModuloNavigation.HorasTotais;

                        table.AddCell(new Cell().Add(new Paragraph(moduloNome)).SetPaddingLeft(20)); // Indentação para parecer sub-item
                        table.AddCell(new Cell().Add(new Paragraph(horas.ToString("0") + "h")).SetTextAlignment(TextAlignment.CENTER));
                    }
                }

                document.Add(table);

                int totalPaginas = pdf.GetNumberOfPages();

                for (int i = 1; i <= totalPaginas; i++)
                {
                    PdfPage page = pdf.GetPage(i);
                    float width = page.GetPageSize().GetWidth();

                    new Canvas(new PdfCanvas(page), new Rectangle(0, 20, width, 20))
                    .Add(new Paragraph($"Página {i} de {totalPaginas}")
                        .SetFontSize(9)
                        .SetFontColor(DeviceGray.GRAY)
                        .SetTextAlignment(TextAlignment.CENTER))
                    .Close();
                }

                document.Close();

                // --- retorno do ficheiro ---
                byte[] fileBytes = ms.ToArray();
                return File(fileBytes, "application/pdf", $"Ficha_{formador.IdUtilizadorNavigation.Nome}.pdf");
            }
        }

        /// <summary>
        /// Cria um novo perfil de formador.
        /// Caso o utilizador ainda não exista, é criado automaticamente.
        /// Suporta upload de fotografia e documento pdf.
        /// </summary>
        /// <param name="dto">
        /// Dados necessários para criação do formador.
        /// </param>
        /// <returns>
        /// Resultado da operação de criação.
        /// </returns>
        // POST: api/Formadores
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPost]
        public async Task<IActionResult> CreateFormador([FromForm] FormadorCreateDTO dto)
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
                        IdTipoUtilizador = 2, // Formador
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
                        return Conflict(new { message = "Este utilizador já tem um perfil de formador ativo." });

                    // Verificar se ele já tem perfil de formando
                    if (await _context.Formandos.AnyAsync(f => f.IdUtilizador == utilizadorExistente.IdUtilizador))
                        return Conflict(new { message = "Este utilizador já tem um perfil de formando ativo, por favor altere o tipo de utilizador na tab utilizador!" });

                    // Alteramos os dados se necessario (ou colocamos os que vao preencher automaticamente os campos)
                    utilizadorExistente.Nome = dto.Nome;
                    utilizadorExistente.Nif = dto.Nif;
                    utilizadorExistente.Telefone = dto.Telefone;
                    utilizadorExistente.DataNascimento = dto.DataNascimento;
                    utilizadorExistente.Morada = dto.Morada;
                    utilizadorExistente.Telefone = dto.Telefone;
                    utilizadorExistente.Sexo = dto.Sexo;
                    utilizadorExistente.IdTipoUtilizador = 2; // Formador
                    // Não trocamos a password e email


                    userId = utilizadorExistente.IdUtilizador;
                }

                // Criar Perfil de Formador vinculado ao userId
                var novoFormador = new Formador
                {
                    IdUtilizador = userId,
                    Iban = dto.Iban,
                    Qualificacoes = dto.Qualificacoes
                };

                // Tratamento de Ficheiros
                if (dto.Fotografia != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Fotografia.CopyToAsync(ms);
                    novoFormador.Fotografia = ms.ToArray();
                }

                if (dto.Documento != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Documento.CopyToAsync(ms);
                    novoFormador.AnexoFicheiro = ms.ToArray();
                }

                _context.Formadores.Add(novoFormador);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return Ok(new { message = "Formador registado com sucesso!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = "Erro ao registar formador: " + ex.Message });
            }
        }

        /// <summary>
        /// Atualiza os dados de um formador existente.
        /// </summary>
        /// <param name="id">Id do formador.</param>
        /// <param name="dto">Dados atualizados do formador.</param>
        /// <remarks>
        /// - Atualiza dados pessoais;
        /// - Atualiza qualificações e IBAN;
        /// - Permite substituir fotografia e documento;
        /// - Atualiza associações aos tipos de matéria;
        /// - Executa dentro de transação.
        /// </remarks>
        /// <returns>
        /// 200 OK se atualizado com sucesso;
        /// 404 NotFound se o formador não existir;
        /// 409 Conflict se o NIF estiver em uso por outro utilizador;
        /// 400 BadRequest em caso de erro.
        /// </returns>
        // PUT: api/Formadores/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFormador(int id, [FromForm] FormadorCreateDTO dto)
        {
            var formador = await _context.Formadores
                .Include(f => f.IdUtilizadorNavigation)
                .Include(f => f.FormadoresTipoMaterias)
                .FirstOrDefaultAsync(f => f.IdFormador == id);

            if (formador == null)
                return NotFound(new { message = "Formador não encontrado." });

            bool nifEmUso = await _context.Utilizadores.AnyAsync(u =>
                u.Nif == dto.Nif && u.IdUtilizador != formador.IdUtilizador);

            if (nifEmUso)
                return Conflict(new { message = "O NIF introduzido já pertence a outro utilizador." });

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var u = formador.IdUtilizadorNavigation;
                u.Nome = dto.Nome;
                u.Nif = dto.Nif;
                u.Telefone = dto.Telefone;
                u.Morada = dto.Morada;
                u.DataNascimento = dto.DataNascimento;
                u.Sexo = dto.Sexo;

                formador.Iban = dto.Iban;
                formador.Qualificacoes = dto.Qualificacoes;

                if (dto.Fotografia != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Fotografia.CopyToAsync(ms);
                    formador.Fotografia = ms.ToArray();
                }

                if (dto.Documento != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Documento.CopyToAsync(ms);
                    formador.AnexoFicheiro = ms.ToArray();
                }

                // remover todas as associações antigas
                _context.FormadoresTipoMaterias.RemoveRange(
                    formador.FormadoresTipoMaterias
                );

                // inserir as novas
                foreach (var idTipo in dto.TiposMateria.Distinct())
                {
                    _context.FormadoresTipoMaterias.Add(new FormadorTipoMateria
                    {
                        IdFormador = id,
                        IdTipoMateria = idTipo
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Perfil atualizado com sucesso!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = "Erro ao atualizar: " + ex.Message });
            }
        }


        /// <summary>
        /// Desativa um formador no sistema (soft delete).
        /// </summary>
        /// <param name="id">Identificador do formador.</param>
        /// <remarks>
        /// - Impede eliminação caso existam aulas futuras agendadas;
        /// - Marca o formador e o utilizador associado como inativos;
        /// - Regista data de desativação.
        /// </remarks>
        /// <returns>
        /// 204 NoContent se desativado com sucesso;
        /// 400 BadRequest se existirem aulas futuras;
        /// 404 NotFound se o formador não existir.
        /// </returns>
        // DELETE: api/Formadores/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFormador(int id)
        {
            var formador = await _context.Formadores
                     .Include(f => f.IdUtilizadorNavigation)
                     .FirstOrDefaultAsync(f => f.IdFormador == id);

            if (formador == null)
                return NotFound(new { message = "Formador não encontrado." });

            //Aulas futuras marcadas
            var aulasFuturasMarcadas = await _context.Horarios
                .AnyAsync(h => h.IdFormador == formador.IdFormador &&
                h.Data > DateOnly.FromDateTime(DateTime.Now));

            if (aulasFuturasMarcadas)
                return BadRequest(new
                {
                    message = "Não é possível eliminar o formador pois ele está tem aulas " +
                    "agendadas para o futuro."
                });

            formador.Ativo = false;
            formador.DataDesativacao = DateTime.Now;

            if (formador.IdUtilizadorNavigation != null)
            {
                formador.IdUtilizadorNavigation.Ativo = false;
                formador.IdUtilizadorNavigation.DataDesativacao = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            return NoContent();

        }

        /// <summary>
        /// Obtém o total de horas lecionadas pelo formador autenticado
        /// durante o mês atual.
        /// </summary>
        /// <remarks>
        /// Considera apenas horários anteriores ao dia atual.
        /// </remarks>
        /// <returns>
        /// 200 OK com o total de horas;
        /// 401 Unauthorized se o utilizador não estiver autenticado.
        /// </returns>
        [Authorize(Policy = "Formador")]
        [HttpGet("mesatual")]
        public async Task<ActionResult<HorasFormadorDTO>> GetHorasMesAtual()
        {
            var formadorId = await GetFormadorIdFromToken();
            if (formadorId == null) return Unauthorized();

            var hoje = DateOnly.FromDateTime(DateTime.Today);

            var horarios = await _context.Horarios
                .Where(h =>
                    h.IdFormador == formadorId &&
                    h.Data.Month == hoje.Month &&
                    h.Data.Year == hoje.Year &&
                    h.Data.Day < hoje.Day
                )
                .ToListAsync();

            var totalHoras = horarios.Sum(h =>
                (h.HoraFim.ToTimeSpan() - h.HoraInicio.ToTimeSpan()).TotalHours
            );

            return Ok(new HorasFormadorDTO { TotalHoras = totalHoras });
        }

        /// <summary>
        /// Obtém o total de horas lecionadas pelo formador autenticado
        /// durante o mês anterior.
        /// </summary>
        /// <returns>
        /// 200 OK com o total de horas;
        /// 401 Unauthorized se o utilizador não estiver autenticado.
        /// </returns>
        // GET: api/formadores/mesanterior
        [Authorize(Policy = "Formador")]
        [HttpGet("mesanterior")]
        public async Task<ActionResult<HorasFormadorDTO>> GetHorasMesAnterior()
        {
            var formadorId = await GetFormadorIdFromToken();
            if (formadorId == null) return Unauthorized();

            var hoje = DateOnly.FromDateTime(DateTime.Today);
            var mesAnterior = hoje.AddMonths(-1);

            var horarios = await _context.Horarios
                .Where(h =>
                    h.IdFormador == formadorId &&
                    h.Data.Month == mesAnterior.Month &&
                    h.Data.Year == mesAnterior.Year
                )
                .ToListAsync();

            var totalHoras = horarios.Sum(h =>
                (h.HoraFim.ToTimeSpan() - h.HoraInicio.ToTimeSpan()).TotalHours
            );

            return Ok(new HorasFormadorDTO { TotalHoras = totalHoras });
        }

        /// <summary>
        /// Obtém o número total de turmas distintas
        /// associadas ao formador autenticado.
        /// </summary>
        /// <returns>
        /// Número de turmas distintas;
        /// 401 Unauthorized se o utilizador não estiver autenticado.
        /// </returns>
        [Authorize(Policy = "Formador")]
        [HttpGet("numTurmas")]
        public async Task<int> GetNumTurmasFormador()
        {
            var formadorId = await GetFormadorIdFromToken();

            return await _context.TurmaAlocacoes.Where(ta => ta.IdFormador == formadorId).GroupBy(ta => ta.IdTurma).CountAsync();
        }

        /// <summary>
        /// Obtém o identificador do formador com base no token JWT
        /// do utilizador autenticado.
        /// </summary>
        /// <returns>
        /// Id do formador ou null se não existir.
        /// </returns>
        private async Task<int?> GetFormadorIdFromToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return null;

            int userId = int.Parse(userIdClaim);

            return await _context.Formadores
                .Where(f => f.IdUtilizador == userId)
                .Select(f => f.IdFormador)
                .FirstOrDefaultAsync();
        }

    }


}