using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Formador;
using ProjetoAdministracaoEscola.ModelsDTO.GetMinhaTurma;
using ProjetoAdministracaoEscola.ModelsDTO.Turma;
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
        public async Task<IActionResult> PostTurma([FromForm] TurmaDTO turmadto)
        {
            var turmaExistente = await _context.Turmas.FirstOrDefaultAsync(t => t.NomeTurma == turmadto.NomeTurma);
            

            if (turmaExistente != null)
            {
                return BadRequest(new { message = "Já existe uma turma com esse nome!" });
            }

            if (turmadto.DataFim <= turmadto.DataInicio)
            {
                return BadRequest(new { message = "A data de fim não pode ser anterior à data início." });
            }

            try
            {
                var novaTurma = new Turma
                {
                    NomeTurma = turmadto.NomeTurma,
                    DataInicio = turmadto.DataInicio,
                    DataFim = turmadto.DataFim,
                    IdCurso = turmadto.IdCurso,
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
    }
}
