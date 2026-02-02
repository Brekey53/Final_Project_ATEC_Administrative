using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Avaliacao;
using ProjetoAdministracaoEscola.ModelsDTO.Turma;
using System.Security.Claims;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TurmaAlocacaoController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public TurmaAlocacaoController(SistemaGestaoContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém a lista de turmas e módulos associados ao formador autenticado,
        /// incluindo o número de horas dadas, horas totais do módulo e o estado atual
        /// (Para começar, A decorrer ou Terminado).
        /// </summary>
        /// <returns>
        /// Lista de turmas e módulos atribuídos ao formador autenticado.
        /// </returns>
        [HttpGet("turmas/formador")]
        public async Task<ActionResult<IEnumerable<TurmaFormadorDTO>>> GetTurmasDoFormador()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            var formadorId = await _context.Formadores
                .Where(f => f.IdUtilizador == userId)
                .Select(f => f.IdFormador)
                .FirstOrDefaultAsync();

            if (formadorId == 0)
                return BadRequest("Utilizador não é formador");

            var alocacoes = await _context.TurmaAlocacoes
                .Where(a => a.IdFormador == formadorId)
                .Include(a => a.IdTurmaNavigation)
                    .ThenInclude(t => t.IdCursoNavigation)
                .Include(a => a.IdModuloNavigation)
                .ToListAsync();

            var hoje = DateOnly.FromDateTime(DateTime.Today);

            var resultado = alocacoes.Select(a =>
            {
                var horarios = _context.Horarios
                    .Where(h =>
                        h.IdTurma == a.IdTurma &&
                        h.IdCursoModuloNavigation.IdModulo == a.IdModulo &&
                        h.IdFormador == formadorId &&
                        h.Data <= hoje
                    )
                    .ToList();

                var horasDadas = CalcularHorasDadas(horarios);
                var horasTotais = a.IdModuloNavigation.HorasTotais;

                var dataInicio = a.IdTurmaNavigation.DataInicio;
                var dataFim = a.IdTurmaNavigation.DataFim;

                string estado;

                if (horasDadas == 0)
                {
                    estado = "Para começar";
                }
                else if (horasDadas < horasTotais)
                {
                    estado = "A decorrer";
                }
                else
                {
                    estado = "Terminado";
                }


                return new TurmaFormadorDTO
                {
                    IdTurma = a.IdTurma,
                    IdModulo = a.IdModulo,
                    NomeTurma = a.IdTurmaNavigation.NomeTurma,
                    NomeCurso = a.IdTurmaNavigation.IdCursoNavigation.Nome,
                    NomeModulo = a.IdModuloNavigation.Nome,
                    HorasDadas = horasDadas,
                    HorasTotaisModulo = horasTotais,
                    Estado = estado
                };
            })
            .OrderBy(t => t.NomeTurma)
            .ThenBy(t => t.NomeModulo)
            .ToList();

            return Ok(resultado);
        }

        /// <summary>
        /// Obtém a lista de turmas e módulos associados ao formador com Id inserido no parametro do metodo,
        /// incluindo o número de horas dadas, horas totais do módulo e o estado atual
        /// (Para começar, A decorrer ou Terminado).
        /// </summary>
        /// <returns>
        /// Lista de turmas e módulos atribuídos ao formador.
        /// </returns>
        [HttpGet("turmas/formador/{idFormador}")]
        public async Task<ActionResult<IEnumerable<TurmaFormadorDTO>>> GetTurmasDoFormador(int idFormador)
        {

            // Validar se o formador existe
            var existeFormador = await _context.Formadores.AnyAsync(f => f.IdFormador == idFormador);
            if (!existeFormador) return BadRequest(new { message = "Formador não encontrado" });

            // Carregar Alocações e os Horários relacionados
            var alocacoes = await _context.TurmaAlocacoes
                    .Where(a => a.IdFormador == idFormador)
                    .Include(a => a.IdTurmaNavigation)
                        .ThenInclude(t => t.IdCursoNavigation)
                    .Include(a => a.IdModuloNavigation)
                    .ToListAsync();

            var hoje = DateOnly.FromDateTime(DateTime.Today);

            // Processamento em Memória (Muito mais rápido)
            var resultado = new List<TurmaFormadorModuloCursoDTO>();

            foreach (var a in alocacoes)
            {
                // A forma mais performante seria carregar todos os horários deste formador antes do loop,
                // mas vamos manter simples corrigindo apenas o erro principal.
                var horarios = await _context.Horarios
                    .Where(h =>
                        h.IdTurma == a.IdTurma &&
                        h.IdCursoModuloNavigation.IdModulo == a.IdModulo &&
                        h.IdFormador == idFormador &&
                        h.Data <= hoje
                    )
                    .ToListAsync();

                var horasDadas = CalcularHorasDadas(horarios);
                var horasTotais = a.IdModuloNavigation.HorasTotais;

                string estado;
                if (horasDadas == 0) estado = "Para começar";
                else if (horasDadas < horasTotais) estado = "A decorrer";
                else estado = "Terminado";

                var cursoModulo = await _context.CursosModulos
                .FirstOrDefaultAsync(cm =>
                    cm.IdCurso == a.IdTurmaNavigation.IdCurso &&
                    cm.IdModulo == a.IdModulo
                );

                // Se por algum motivo a matriz do curso estiver mal configurada, ignoramos esta linha
                if (cursoModulo == null) continue;

                // Filtro opcional: Se quiseres mostrar APENAS o que ele pode agendar,
                // podes descomentar a linha abaixo para esconder os módulos terminados:
                if (estado == "Terminado") continue;

                resultado.Add(new TurmaFormadorModuloCursoDTO
                {
                    IdTurma = a.IdTurma,
                    IdModulo = a.IdModulo,
                    IdCursoModulo = cursoModulo.IdCursoModulo,
                    NomeTurma = a.IdTurmaNavigation.NomeTurma,
                    NomeCurso = a.IdTurmaNavigation.IdCursoNavigation.Nome,
                    NomeModulo = a.IdModuloNavigation.Nome,
                    HorasDadas = horasDadas,
                    HorasTotaisModulo = horasTotais,
                    Estado = estado
                });
            }

            return Ok(resultado.OrderBy(t => t.NomeTurma).ThenBy(t => t.NomeModulo));
        }


        /// <summary>
        /// Obtém as avaliações dos formandos de uma determinada turma e módulo.
        /// Caso o formando ainda não tenha avaliação, a nota é devolvida como nula.
        /// </summary>
        /// <param name="turmaId">Id da turma.</param>
        /// <param name="moduloId">Id do módulo.</param>
        /// <returns>
        /// Lista de formandos com a respetiva avaliação no módulo indicado.
        /// </returns>
        [HttpGet("avaliacoes")]
        public async Task<ActionResult<IEnumerable<AvaliacaoAlunoDTO>>> GetAvaliacoes(int turmaId, int moduloId)
        {
            var alunos = await _context.Inscricoes
                .Where(i => i.IdTurma == turmaId)
                .Select(i => new AvaliacaoAlunoDTO
                {
                    IdInscricao = i.IdInscricao,
                    IdFormando = i.IdFormando,
                    NomeFormando = i.IdFormandoNavigation.IdUtilizadorNavigation.Nome,
                    Nota = _context.Avaliacoes
                        .Where(a => a.IdInscricao == i.IdInscricao && a.IdModulo == moduloId)
                        .Select(a => a.Nota)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(alunos);
        }

        /// <summary>
        /// Guarda ou atualiza as avaliações dos formandos para um determinado módulo.
        /// Se a avaliação já existir, a nota é atualizada; caso contrário, é criada uma nova.
        /// </summary>
        /// <param name="avaliacoes">
        /// Lista de avaliações a registar, contendo o identificador da inscrição,
        /// do módulo e a respetiva nota.
        /// </param>
        /// <returns>
        /// Resultado da operação de gravação das avaliações.
        /// </returns>
        [HttpPost("avaliacoes")]
        public async Task<IActionResult> GuardarAvaliacoes(List<DarAvaliacaoDTO> avaliacoes)
        {
            if (avaliacoes == null || !avaliacoes.Any())
                return BadRequest();

            if (avaliacoes.Any(a => a.Nota < 0 || a.Nota > 20))
                return BadRequest("Notas inválidas");

            var hoje = DateOnly.FromDateTime(DateTime.Today);


            foreach (var a in avaliacoes)
            {
                var existente = await _context.Avaliacoes
                    .FirstOrDefaultAsync(x =>
                        x.IdInscricao == a.IdInscricao &&
                        x.IdModulo == a.IdModulo
                    );

                if (existente == null)
                {
                    _context.Avaliacoes.Add(new Avaliacao
                    {
                        IdInscricao = a.IdInscricao,
                        IdModulo = a.IdModulo,
                        Nota = a.Nota,
                        DataAvaliacao = hoje
                    });
                }
                else
                {
                    existente.Nota = a.Nota;
                }
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        /// <summary>
        /// Calcula o número total de horas dadas com base numa lista de horários.
        /// Apenas são consideradas as sessões em que a hora de fim é superior à hora de início.
        /// </summary>
        /// <param name="horarios">Coleção de horários</param>
        /// <returns>Total de horas dadas.</returns>
        public static double CalcularHorasDadas(IEnumerable<Horario> horarios)
        {
            return horarios.Sum(h =>
            {
                if (h.HoraFim <= h.HoraInicio)
                    return 0;

                return (h.HoraFim - h.HoraInicio).TotalHours;
            });
        }


    }

}
