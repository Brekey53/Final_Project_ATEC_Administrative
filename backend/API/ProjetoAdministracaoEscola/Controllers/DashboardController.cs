using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.ModelsDTO.Curso;
using ProjetoAdministracaoEscola.ModelsDTO.Formador;
using ProjetoAdministracaoEscola.ModelsDTO.Turma;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public DashboardController(SistemaGestaoContext context){
            _context = context;
        }

        /// <summary>
        /// Obtém estatísticas gerais do sistema.
        /// </summary>
        /// <remarks>
        /// Devolve informação agregada como:
        /// - Número de cursos a decorrer
        /// - Número de turmas concluídas
        /// - Total de formandos ativos
        /// - Total de formadores
        /// - Total de salas
        /// - Total de módulos
        /// </remarks>
        /// <returns>
        /// 200 OK com objeto contendo os indicadores estatísticos.
        /// </returns>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = new
            {
                CursosDecorrer = await _context.Turmas.CountAsync(t => t.DataFim > DateOnly.FromDateTime(DateTime.Now)),
                TurmasConcluidas = await GetTurmasConcluidas(),
                FormandosAtivos = await _context.Formandos.CountAsync(),
                Formadores = await _context.Formadores.CountAsync(),
                Salas = await _context.Salas.CountAsync(),
                Modulos = await _context.Modulos.CountAsync()
            };

            return Ok(stats);
        }

        /// <summary>
        /// Obtém o total de turmas concluídas, ou seja, com data fim
        /// inferior ou igual ao dia atual
        /// </summary>
        /// <returns>
        /// Número total de turmas concluídas
        /// </returns>
        private async Task<int> GetTurmasConcluidas()
        {
            var hoje = DateOnly.FromDateTime(DateTime.Now);
            return await _context.Turmas.CountAsync(t => t.DataFim <= hoje);
        }

        /// <summary>
        /// Obtém a lista de turmas que se encontram atualmente a decorrer.
        /// </summary>
        /// <remarks>
        /// Uma turma é considerada "a decorrer" quando a data atual
        /// está entre a data de início e a data de fim.
        /// </remarks>
        /// <returns>
        /// 200 OK com lista de turmas em curso.
        /// </returns>
        [HttpGet("turmasDecorrer")]
        public async Task<ActionResult<IEnumerable<TurmaDecorrerDTO>>> GetTurmasADecorrer()
        {
            var hoje = DateOnly.FromDateTime(DateTime.Today);

            var turmas = await _context.Turmas
                .Include(t => t.IdCursoNavigation)
                .Select(t => new TurmaDecorrerDTO
                {
                    IdTurma = t.IdTurma,
                    NomeTurma = t.NomeTurma,
                    NomeCurso = t.IdCursoNavigation.Nome,
                    DataInicio = t.DataInicio,
                    DataFim = t.DataFim
                })
                .Where(t => t.DataInicio <= hoje && t.DataFim >= hoje)
                .OrderBy(t => t.DataInicio)
                .ToListAsync();

            return Ok(turmas);
        }

        /// <summary>
        /// Obtém a lista de turmas que irão iniciar nos próximos 60 dias.
        /// </summary>
        /// <remarks>
        /// Considera turmas cuja data de início seja superior à data atual
        /// e inferior ou igual ao limite de 60 dias.
        /// </remarks>
        /// <returns>
        /// 200 OK com lista de turmas futuras.
        /// </returns>
        // GET: api/dashboard/turmasAIniciar
        [HttpGet("turmasAIniciar")]
        public async Task<ActionResult<IEnumerable<TurmaDecorrerDTO>>> GetTurmasAIniciar()
        {
            var hoje = DateOnly.FromDateTime(DateTime.Today);
            var limite = hoje.AddDays(60);

            var turmas = await _context.Turmas
                .Include(t => t.IdCursoNavigation)
                .Select(t => new TurmaDecorrerDTO
                {
                    IdTurma = t.IdTurma,
                    NomeTurma = t.NomeTurma,
                    NomeCurso = t.IdCursoNavigation.Nome,
                    DataInicio = t.DataInicio,
                    DataFim = t.DataFim
                })
                .Where(t => t.DataInicio <= limite && t.DataInicio > hoje)
                .OrderBy(t => t.DataInicio)
                .ToListAsync();

            return Ok(turmas);
        }

        /// <summary>
        /// Obtém o número total de cursos agrupados por área.
        /// </summary>
        /// <remarks>
        /// Agrupa os cursos pela área associada e devolve
        /// o total de cursos por cada área, ordenado de forma decrescente.
        /// </remarks>
        /// <returns>
        /// 200 OK com lista de áreas e respetivo total de cursos.
        /// </returns>
        // GET: api/dashboard/cursosPorArea
        [HttpGet("cursosPorArea")]
        public async Task<ActionResult<IEnumerable<CursosPorAreaDTO>>> GetCursosPorArea()
        {
            var data = await _context.Cursos
                .Include(c => c.IdAreaNavigation)
                .GroupBy(c => new
                {
                    c.IdArea,
                    c.IdAreaNavigation.Nome
                })
                .Select(g => new CursosPorAreaDTO
                {
                    IdArea = g.Key.IdArea,
                    NomeArea = g.Key.Nome,
                    TotalCursos = g.Count()
                })
                .OrderByDescending(x => x.TotalCursos)
                .ToListAsync();

            return Ok(data);
        }

        /// <summary>
        /// Obtém o top 10 de formadores com maior número de horas lecionadas.
        /// </summary>
        /// <remarks>
        /// Considera apenas horários já concluídos (datas anteriores à atual).
        /// Calcula o total de horas lecionadas por formador
        /// e devolve os 10 com maior carga horária.
        /// </remarks>
        /// <returns>
        /// 200 OK com lista dos formadores ordenados por horas lecionadas.
        /// </returns>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("topformadores")]
        public async Task<ActionResult<IEnumerable<TopFormadoresDTO>>> GetTopFormadores()
        {
            var hoje = DateOnly.FromDateTime(DateTime.Now);

            var dados = await _context.Horarios
                .Where(h => h.Data < hoje)
                .Select(h => new
                {
                    h.IdFormador,
                    Nome = h.IdFormadorNavigation.IdUtilizadorNavigation.Nome,
                    h.HoraInicio,
                    h.HoraFim
                })
                .ToListAsync();

            var topFormadores = dados
                .GroupBy(h => new { h.IdFormador, h.Nome })
                .Select(g => new TopFormadoresDTO
                {
                    Nome = g.Key.Nome,
                    Horas = Math.Round(
                        g.Sum(h => (h.HoraFim - h.HoraInicio).TotalHours)
                    )
                })
                .OrderByDescending(x => x.Horas)
                .Take(10)
                .ToList();

            return Ok(topFormadores);
        }
    }
}

