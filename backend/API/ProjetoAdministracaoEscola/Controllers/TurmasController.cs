using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Formador;
using ProjetoAdministracaoEscola.ModelsDTO.Formador.Responses;
using ProjetoAdministracaoEscola.ModelsDTO.GetMinhaTurma.Requests;
using ProjetoAdministracaoEscola.ModelsDTO.Turma.Requests;
using ProjetoAdministracaoEscola.ModelsDTO.Turma.Responses;
using System.Security.Claims;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TurmasController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public TurmasController(SistemaGestaoContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém a lista completa de turmas registadas no sistema.
        /// </summary>
        /// <remarks>
        /// Para cada turma são devolvidos:
        /// - Identificação da turma
        /// - Curso associado
        /// - Metodologia de horário
        /// - Datas de início e fim
        /// - Estado atual calculado automaticamente:
        ///     "Para começar"
        ///     "A decorrer"
        ///     "Terminada"
        /// </remarks>
        /// <returns>
        /// Lista de <see cref="TurmaDTO"/>.
        /// </returns>
        /// <response code="200">Lista devolvida com sucesso.</response>
        // GET: api/Turmas
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TurmaDTO>>> GetTurmas()
        {
            return await _context.Turmas
                .Include(t => t.IdCursoNavigation)
                .Include(t => t.IdMetodologiaNavigation)
                .Select(t => new TurmaDTO
                {
                    IdTurma = t.IdTurma,
                    NomeTurma = t.NomeTurma,
                    DataInicio = t.DataInicio,
                    DataFim = t.DataFim,
                    IdCurso = t.IdCurso,
                    NomeCurso = t.IdCursoNavigation.Nome,
                    Estado = CalcularEstadoTurma(t.DataInicio, t.DataFim),
                    IdMetodologia = t.IdMetodologia,
                    NomeMetodologia = t.IdMetodologiaNavigation.Nome
                })
                .ToListAsync();
        }

        /// <summary>
        /// Obtém a lista de metodologias de horário disponíveis.
        /// </summary>
        /// <remarks>
        /// Cada metodologia inclui:
        /// - Intervalo horário diário
        /// - Período de pausa para refeição
        /// </remarks>
        /// <returns>
        /// Lista de <see cref="MetodologiaDTO"/>.
        /// </returns>
        /// <response code="200">Lista devolvida com sucesso.</response>
        [Authorize]
        [HttpGet("metodologias")]
        public async Task<ActionResult<IEnumerable<MetodologiaDTO>>> GetMetodologias()
        {
            return await _context.MetodologiasHorarios
                .Select(mh => new MetodologiaDTO
                {
                     IdMetodologia = mh.IdMetodologia,
                     Nome = mh.Nome,
                     HorarioInicio = mh.HorarioInicio,
                     HorarioFim = mh.HorarioFim,
                     PausaRefeicaoInicio = mh.PausaRefeicaoInicio,
                     PausaRefeicaoFim = mh.PausaRefeicaoFim
                })
                .ToListAsync();
        }

        /// <summary>
        /// Obtém todas as turmas cuja data de início é posterior à data atual.
        /// </summary>
        /// <remarks>
        /// As turmas são devolvidas ordenadas por data de início crescente.
        /// Apenas são consideradas turmas futuras.
        /// </remarks>
        /// <returns>
        /// Lista de <see cref="TurmaDTO"/> correspondentes às próximas turmas.
        /// </returns>
        /// <response code="200">Lista devolvida com sucesso.</response>
        // GET: api/proximasturmas
        [Authorize]
        [HttpGet("proximasturmas")]
        public async Task<ActionResult<IEnumerable<TurmaDTO>>> GetProximasTurmas()
        {
            var hoje = DateOnly.FromDateTime(DateTime.Now);

            return await _context.Turmas
                //.Include(t => t.IdCursoNavigation.Nome)
                .Where(t => t.DataInicio > hoje)
                .OrderBy(t => t.DataInicio)
                .Select(t => new TurmaDTO
                {
                    IdTurma = t.IdTurma,
                    NomeTurma = t.NomeTurma,
                    DataInicio = t.DataInicio,
                    DataFim = t.DataFim,
                    IdCurso = t.IdCurso,
                    NomeCurso = t.IdCursoNavigation.Nome,
                    IdMetodologia = t.IdMetodologia,
                    NomeMetodologia = t.IdMetodologiaNavigation.Nome
                })
                .ToListAsync();
        }

        /// <summary>
        /// Obtém os dados de uma turma específica através do seu identificador.
        /// </summary>
        /// <param name="id">Identificador da turma.</param>
        /// <returns>
        /// DTO <see cref="GetTurmaPorIdDTO"/>.
        /// </returns>
        /// <response code="200">Turma encontrada.</response>
        /// <response code="404">Turma não encontrada.</response>
        // GET: api/Turmas/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("{id}")]
        public async Task<ActionResult<GetTurmaPorIdDTO>> GetTurma(int id)
        {
            var turma = await _context.Turmas
                .Where(t => t.IdTurma == id)
                .Select(t => new GetTurmaPorIdDTO
                {
                    IdTurma = t.IdTurma,
                    NomeTurma = t.NomeTurma,
                    DataInicio = t.DataInicio,
                    DataFim = t.DataFim,
                    IdCurso = t.IdCurso,
                    NomeCurso = t.IdCursoNavigation.Nome,
                    IdMetodologia = t.IdMetodologia,
                    NomeMetodologia = t.IdMetodologiaNavigation.Nome,
                    Estado = CalcularEstadoTurma(t.DataInicio, t.DataFim)
                })
                .FirstOrDefaultAsync();

            if (turma == null)
                return NotFound();

            return Ok(turma);
        }

        /// <summary>
        /// Atualiza os dados de uma turma existente.
        /// </summary>
        /// <param name="id">Identificador da turma a atualizar.</param>
        /// <param name="turmadto">Objeto com os novos dados da turma.</param>
        /// <remarks>
        /// Atualiza:
        /// - Nome da turma
        /// - Datas
        /// - Curso associado
        /// - Metodologia
        /// </remarks>
        /// <returns>
        /// Resultado da operação.
        /// </returns>
        /// <response code="200">Turma atualizada com sucesso.</response>
        /// <response code="400">Turma não encontrada ou dados inválidos.</response>
        // PUT: api/Turmas/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTurma(int id, TurmaDTO turmadto)
        {
            var turma = await _context.Turmas.FirstOrDefaultAsync(t => t.IdTurma == id);

            if (turma == null)
            {
                return BadRequest(new { message = "Erro ao carregar a turma." });
            }

            if(turmadto.DataFim <= turmadto.DataInicio)
            {
                return BadRequest(new { message = "A data de fim não pode ser anterior à data início." });
            }

            turma.IdTurma = turmadto.IdTurma;
            turma.NomeTurma = turmadto.NomeTurma;
            turma.DataInicio = turmadto.DataInicio;
            turma.DataFim = turmadto.DataFim;
            turma.IdCurso = turmadto.IdCurso;
            turma.IdMetodologia = turmadto.IdMetodologia;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Dados atualizados com sucesso!" });
        }

        /// <summary>
        /// Cria uma nova turma no sistema.
        /// </summary>
        /// <param name="turmadto">Dados da nova turma.</param>
        /// <remarks>
        /// Valida:
        /// - Existência prévia de turma com o mesmo nome.
        /// </remarks>
        /// <returns>
        /// Resultado da operação.
        /// </returns>
        /// <response code="200">Turma criada com sucesso.</response>
        /// <response code="400">Já existe turma com o mesmo nome ou erro de validação.</response>
        // POST: api/Turmas
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPost]
        public async Task<IActionResult> PostTurma([FromBody] TurmaDTO turmadto)
        {
            var turmaExistente = await _context.Turmas.FirstOrDefaultAsync(t => t.NomeTurma == turmadto.NomeTurma);
            

            if (turmaExistente != null)
            {
                return BadRequest(new { message = "Já existe uma turma com esse nome!" });
            }

            if (turmadto.DataInicio > turmadto.DataFim)
            {
                return BadRequest(new { message = "A data de fim não pode ser anterior à data início." });
            }

            try
            {
                var novaTurma = new Turma
                {
                    NomeTurma = turmadto.NomeTurma,
                    IdCurso = turmadto.IdCurso,
                    DataInicio = turmadto.DataInicio,
                    DataFim = turmadto.DataFim,
                    IdMetodologia = turmadto.IdMetodologia
                };

                _context.Turmas.Add(novaTurma);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Turma registada com sucesso!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Erro ao guardar na base de dados "});
            }
        }

        /// <summary>
        /// Remove (desativa) uma turma existente.
        /// </summary>
        /// <param name="id">Identificador da turma.</param>
        /// <remarks>
        /// A remoção é lógica (soft delete), definindo a propriedade <c>Ativo</c> como false.
        /// 
        /// Não é permitido eliminar a turma se existirem aulas futuras agendadas.
        /// Requer política "AdminOrAdministrativo".
        /// </remarks>
        /// <returns>
        /// Resultado da operação.
        /// </returns>
        /// <response code="204">Turma desativada com sucesso.</response>
        /// <response code="400">Existem aulas futuras associadas.</response>
        /// <response code="403">Acesso negado.</response>
        /// <response code="404">Turma não encontrada.</response>
        // DELETE: api/Turmas/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTurma(int id)
        {
            var turma = await _context.Turmas.FirstOrDefaultAsync(t => t.IdTurma == id);
            if (turma == null)
            {
                return NotFound(new {message = "Turma não encontrada."});
            }

            var aulasFuturasMarcadas = await _context.Horarios
                .AnyAsync(h => h.IdTurma == id && h.Data > DateOnly.FromDateTime(DateTime.Now));

            if (aulasFuturasMarcadas)
            {
                return BadRequest(new { message = "Não é possível eliminar a turma pois está com aulas agendadas para o futuro." });
            }

            turma.Ativo = false;

            //Não necessario (soft delete)
            //_context.Turmas.Remove(turma);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Calcula o estado atual de uma turma com base nas datas de início e fim.
        /// </summary>
        /// <param name="dataInicio">Data de início da turma.</param>
        /// <param name="dataFim">Data de fim da turma.</param>
        /// <returns>
        /// Estado da turma: "Para começar", "A decorrer" ou "Terminada".
        /// </returns>
        private static string CalcularEstadoTurma(DateOnly dataInicio, DateOnly dataFim)
        {
            var hoje = DateOnly.FromDateTime(DateTime.Today);

            if (hoje < dataInicio)
                return "Para começar";

            if (hoje > dataFim)
                return "Terminada";

            return "A decorrer";
        }

        /// <summary>
        /// Obtém a informação completa da turma ativa do formando autenticado,
        /// incluindo colegas, professores e módulos com avaliações.
        /// </summary>
        /// <returns>
        /// Detalhes da turma do utilizador autenticado.
        /// </returns>
        [HttpGet("minha-turma")]
        public async Task<ActionResult<MinhaTurmaDTO>> GetMinhaTurma()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            // Formando
            var formando = await _context.Formandos
                .FirstOrDefaultAsync(f => f.IdUtilizador == userId);

            if (formando == null)
                return NotFound("Formando não encontrado");

            // Inscrição daquele formando 
            var inscricao = await _context.Inscricoes
                .Include(i => i.IdTurmaNavigation)
                    .ThenInclude(t => t.IdCursoNavigation)
                .FirstOrDefaultAsync(i =>
                    i.IdFormando == formando.IdFormando &&
                    i.Estado == "Ativo");

            if (inscricao == null)
                return NotFound("Formando sem turma ativa");

            var turma = inscricao.IdTurmaNavigation;

            // Colegas da mesma turma do Formando
            var colegas = await _context.Inscricoes
                .Where(i => i.IdTurma == turma.IdTurma && i.IdFormando != formando.IdFormando)
                .Include(i => i.IdFormandoNavigation)
                    .ThenInclude(f => f.IdUtilizadorNavigation)
                .Select(i => new
                {
                    id = i.IdFormandoNavigation.IdFormando,
                    nome = i.IdFormandoNavigation.IdUtilizadorNavigation.Nome,
                    email = i.IdFormandoNavigation.IdUtilizadorNavigation.Email
                })
                .OrderBy(f => f.nome)
                .ToListAsync();


            // Professores que o formando tem
            var professores = await _context.TurmaAlocacoes
                .Where(a => a.IdTurma == turma.IdTurma)
                .Include(a => a.IdFormadorNavigation)
                    .ThenInclude(f => f.IdUtilizadorNavigation)
                .Select(a => new
                {
                    nome = a.IdFormadorNavigation.IdUtilizadorNavigation.Nome,
                    email = a.IdFormadorNavigation.IdUtilizadorNavigation.Email
                })
                .Distinct()
                .OrderBy(a => a.nome)
                .ToListAsync();

            List<MinhaTurma_ModuloDTO> modulos;

            try
            {
                modulos = await ObterModulosComAvaliacoesEProfessores(
                turma.IdTurma,
                inscricao.IdInscricao
            );

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }


            var dto = new MinhaTurmaDTO
            {
                NomeTurma = turma.NomeTurma,
                NomeCurso = turma.IdCursoNavigation.Nome,
                DataInicio = turma.DataInicio,
                DataFim = turma.DataFim,
                Estado = inscricao.Estado,

                Colegas = colegas.Select(c => new ColegaDTO
                {
                    Id = c.id,
                    Nome = c.nome,
                    Email = c.email
                }).ToList(),

                Professores = professores.Select(p => new ProfessorDTO
                {
                    Nome = p.nome,
                    Email = p.email
                }).ToList(),

                Modulos = modulos
            };

            return Ok(dto);
        }

        /// <summary>
        /// Obtém os módulos de uma turma, incluindo as avaliações do formando
        /// e os professores associados a cada módulo.
        /// </summary>
        /// <param name="idTurma">Id da turma.</param>
        /// <param name="idInscricao">Id da inscrição na turma do formando.</param>
        /// <returns>
        /// Lista de módulos com avaliações e professores associados.
        /// </returns>
        private async Task<List<MinhaTurma_ModuloDTO>> ObterModulosComAvaliacoesEProfessores(int idTurma,int idInscricao)
        {
            // Modulos de uma turma
            var modulos = await _context.CursosModulos
                .Where(cm => cm.IdCurso ==
                    _context.Turmas
                        .Where(t => t.IdTurma == idTurma)
                        .Select(t => t.IdCurso)
                        .First()
                )
                .Include(cm => cm.IdModuloNavigation)
                .ToListAsync();

            // avaliações do formando
            var avaliacoes = await _context.Avaliacoes
                .Where(a => a.IdInscricao == idInscricao)
                .ToListAsync();

            // módulos dados por professores
            var alocacoes = await _context.TurmaAlocacoes
                .Where(a => a.IdTurma == idTurma)
                .Include(a => a.IdFormadorNavigation)
                    .ThenInclude(f => f.IdUtilizadorNavigation)
                .ToListAsync();

            // Resultado devolve um Objecto MinhaTurma_ModuloDTO com idModulo, Nome, horastotais, e um array de avaliações e de professores
            var resultado = modulos.Select(cm =>
            {
                var idModulo = cm.IdModuloNavigation.IdModulo;

                return new MinhaTurma_ModuloDTO
                {
                    IdModulo = idModulo,
                    Nome = cm.IdModuloNavigation.Nome,
                    HorasTotais = cm.IdModuloNavigation.HorasTotais,

                    Avaliacoes = avaliacoes
                        .Where(a => a.IdModulo == idModulo)
                        .Select(a => new AvaliacaoDTO
                        {
                            Nota = a.Nota,
                            Data = a.DataAvaliacao
                        })
                        .ToList(),

                    Professores = alocacoes
                        .Where(a => a.IdModulo == idModulo)
                        .Select(a => new ProfessorDTO
                        {
                            Nome = a.IdFormadorNavigation.IdUtilizadorNavigation.Nome,
                            Email = a.IdFormadorNavigation.IdUtilizadorNavigation.Email
                        })
                        .DistinctBy(p => p.Email)
                        .ToList()
                };
            })
            .OrderBy(m => m.Nome)
            .ToList();

            return resultado;
        }

        /// <summary>
        /// Obtém a lista de alunos (Formandos) inscritos numa turma.
        /// </summary>
        /// <param name="id">O identificador da turma.</param>
        /// <remarks>
        /// Retorna apenas inscrições com estado "Ativo".
        /// Inclui informação do utilizador (Nome, Email) e do formando.
        /// </remarks>
        /// <returns>
        /// Uma lista de objetos anónimos contendo os detalhes dos alunos inscritos.
        /// </returns>
        /// <response code="200">Lista de alunos devolvida com sucesso.</response>
        /// <response code="401">Utilizador não autenticado.</response>
        /// <response code="403">Utilizador sem permissões (apenas Admin ou Administrativo).</response>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("{id}/alunos")]
        public async Task<ActionResult<IEnumerable<object>>> GetAlunosTurma(int id)
        {
            var alunos = await _context.Inscricoes
                .Where(i => i.IdTurma == id && i.Estado == "Ativo")
                .Include(i => i.IdFormandoNavigation)
                    .ThenInclude(f => f.IdUtilizadorNavigation)
                .Select(i => new
                {
                    i.IdInscricao,
                    i.IdFormando,
                    i.IdFormandoNavigation.IdUtilizador,
                    Nome = i.IdFormandoNavigation.IdUtilizadorNavigation.Nome,
                    Email = i.IdFormandoNavigation.IdUtilizadorNavigation.Email,
                    Foto = i.IdFormandoNavigation.Fotografia // Optional, if needed
                })
                .ToListAsync();

            return Ok(alunos);
        }

        /// <summary>
        /// Obtém candidatos (Tipo 3 ou 5) que NÃO estão inscritos em nenhuma turma ativa.
        /// </summary>
        /// <remarks>
        /// Utilizado para alocar novos alunos a turmas.
        /// Filtra utilizadores que já possuem uma inscrição ativa em qualquer turma.
        /// Considera apenas utilizadores ativos com Tipo 3 (Formando) ou Tipo 5 (Geral).
        /// </remarks>
        /// <returns>
        /// Lista de candidatos elegíveis para inscrição.
        /// </returns>
        /// <response code="200">Lista de candidatos devolvida com sucesso.</response>
        /// <response code="401">Utilizador não autenticado.</response>
        /// <response code="403">Utilizador sem permissões.</response>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("candidatos-sem-turma")]
        public async Task<ActionResult<IEnumerable<object>>> GetCandidatosSemTurma()
        {
            var usuariosComTurmaAtivaIds = await _context.Inscricoes
                .Where(i => i.Estado == "Ativo")
                .Select(i => i.IdFormandoNavigation.IdUtilizador)
                .Distinct()
                .ToListAsync();

            // Ir buscar apenas tipo de user 3 (formandos) e 5 (geral)
            var candidatos = await _context.Utilizadores
                .Where(u => (u.IdTipoUtilizador == 3 || u.IdTipoUtilizador == 5) && u.StatusAtivacao == true) // Active users only
                .Where(u => !usuariosComTurmaAtivaIds.Contains(u.IdUtilizador))
                .Select(u => new
                {
                    u.IdUtilizador,
                    u.Nome,
                    u.Email,
                    Tipo = u.IdTipoUtilizador == 3 ? "Formando" : "Geral"
                })
                .OrderBy(u => u.Nome)
                .ToListAsync();

            return Ok(candidatos);
        }

        /// <summary>
        /// Adiciona um aluno à turma (cria inscrição).
        /// </summary>
        /// <param name="id">O identificador da turma.</param>
        /// <param name="idUtilizador">O identificador do utilizador a inscrever.</param>
        /// <remarks>
        /// Se o utilizador for do Tipo 5 (Geral), passa automaticamente a Tipo 3 (Formando).
        /// Cria um registo na tabela de Formandos se ainda não existir.
        /// Cria uma nova inscrição com estado "Ativo".
        /// Valida se o utilizador já está inscrito em alguma turma ativa.
        /// </remarks>
        /// <returns>
        /// Mensagem de sucesso.
        /// </returns>
        /// <response code="200">Aluno adicionado com sucesso.</response>
        /// <response code="400">Utilizador inválido, turma inexistente ou aluno já inscrito.</response>
        /// <response code="404">Utilizador ou Turma não encontrados.</response>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPost("{id}/alunos")]
        public async Task<IActionResult> AdicionarAlunoTurma(int id, [FromBody] int idUtilizador)
        {
            // Check if user exists
            var user = await _context.Utilizadores.FindAsync(idUtilizador);
            if (user == null) return NotFound("Utilizador não encontrado.");

            // Check if Turma exists
            var turma = await _context.Turmas.FindAsync(id);
            if (turma == null) return NotFound("Turma não encontrada.");

            // Check if already enrolled in ANY active class
            bool jaInscrito = await _context.Inscricoes
                .AnyAsync(i => i.IdFormandoNavigation.IdUtilizador == idUtilizador && i.Estado == "Ativo");

            if (jaInscrito) return BadRequest("Utilizador já se encontra inscrito numa turma ativa.");

            // Ensure user is Formando (Type 3). If Type 5, convert.
            Formando? formando = null;
            if (user.IdTipoUtilizador == 5)
            {
                user.IdTipoUtilizador = 3; // Promote to Formando
                formando = new Formando { IdUtilizador = idUtilizador, Ativo = true };
                _context.Formandos.Add(formando);
                await _context.SaveChangesAsync(); // Save to get IdFormando
            }
            else if (user.IdTipoUtilizador == 3)
            {
                formando = await _context.Formandos.FirstOrDefaultAsync(f => f.IdUtilizador == idUtilizador);
                if (formando == null)
                {
                    // Should exist, but if not create
                    formando = new Formando { IdUtilizador = idUtilizador, Ativo = true };
                    _context.Formandos.Add(formando);
                    await _context.SaveChangesAsync();
                }
            }
            else
            {
                return BadRequest("Apenas utilizadores Geral ou Formando podem ser inscritos.");
            }

            // Create Inscricao
            var novaInscricao = new Inscrico
            {
                IdTurma = id,
                IdFormando = formando.IdFormando,
                DataInscricao = DateOnly.FromDateTime(DateTime.Now),
                Estado = "Ativo"
            };

            _context.Inscricoes.Add(novaInscricao);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Aluno adicionado com sucesso." });
        }

        /// <summary>
        /// Remove um aluno de uma turma específica.
        /// </summary>
        /// <param name="id">O identificador da turma.</param>
        /// <param name="idUtilizador">O identificador do utilizador (aluno) a remover.</param>
        /// <remarks>
        /// Remove fisicamente o registo de inscrição do aluno na turma especificada.
        /// A operação é impedida se o aluno já tiver avaliações ou outros dados associados a essa inscrição, 
        /// para garantir a integridade dos dados históricos.
        /// </remarks>
        /// <returns>
        /// Sem conteúdo (204) em caso de sucesso.
        /// </returns>
        /// <response code="204">Aluno removido da turma com sucesso.</response>
        /// <response code="400">Não é possível remover o aluno devido a dependências existentes (ex: avaliações).</response>
        /// <response code="404">Formando, Turma ou Inscrição não encontrados.</response>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpDelete("{id}/alunos/{idUtilizador}")]
        public async Task<IActionResult> RemoverAlunoTurma(int id, int idUtilizador)
        {
            var formando = await _context.Formandos.FirstOrDefaultAsync(f => f.IdUtilizador == idUtilizador);
            if (formando == null) return NotFound("Formando não encontrado.");

            var inscricao = await _context.Inscricoes
                .FirstOrDefaultAsync(i => i.IdTurma == id && i.IdFormando == formando.IdFormando && i.Estado == "Ativo");

            if (inscricao == null) return NotFound("Inscrição não encontrada nesta turma.");

            try
            {
                _context.Inscricoes.Remove(inscricao);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception)
            {
                // Catch FK constraint issues (e.g., existing grades)
                return BadRequest(new { message = "Não é possível remover o aluno pois já existem avaliações/dados associados a esta inscrição." });
            }
        }
    }
}
