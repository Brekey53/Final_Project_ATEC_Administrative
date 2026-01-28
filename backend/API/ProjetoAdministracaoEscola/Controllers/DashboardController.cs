using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.ModelsDTO;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public DashboardController(SistemaGestaoContext context){
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = new
            {
                CursosDecorrer = await _context.Turmas.CountAsync(t => t.DataFim > DateOnly.FromDateTime(DateTime.Now)),
                TotalCursos = await _context.Cursos.CountAsync(),
                FormandosAtivos = await _context.Formandos.CountAsync(),
                Formadores = await _context.Formadores.CountAsync(),
                Salas = await _context.Salas.CountAsync(),
                Modulos = await _context.Modulos.CountAsync()
            };

            return Ok(stats);
        }

       
        [HttpGet("turmasDecorrer")]
        public async Task<ActionResult<IEnumerable<TurmaDecorrerDTO>>> GetTurmasADecorrer()
        {
            var hoje = DateOnly.FromDateTime(DateTime.Today);

            // Very nice try but yeyy!
            //var turmas = await _context.Horarios
            //    .Include(h => h.IdTurmaNavigation)
            //    .Include(h => h.IdCursoModuloNavigation)
            //        .ThenInclude(cm => cm.IdCursoNavigation)
            //    .GroupBy(h => new
            //    {
            //        h.IdTurma,
            //        h.IdTurmaNavigation.NomeTurma,
            //        h.IdCursoModuloNavigation.IdCursoNavigation.Nome
            //    })
            //    .Select(g => new TurmaDecorrerDTO
            //    {
            //        IdTurma = g.Key.IdTurma,
            //        NomeTurma = g.Key.NomeTurma,
            //        NomeCurso = g.Key.Nome,
            //        DataInicio = g.Min(x => x.Data),
            //        DataFim = g.Max(x => x.Data)
            //    })
            //    .Where(t => t.DataInicio <= hoje && t.DataFim >= hoje)
            //    .OrderBy(t => t.DataInicio)
            //    .ToListAsync();

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

        // GET: api/dashboard/turmasAIniciar
        [HttpGet("turmasAIniciar")]
        public async Task<ActionResult<IEnumerable<TurmaDecorrerDTO>>> GetTurmasAIniciar()
        {
            var hoje = DateOnly.FromDateTime(DateTime.Today);
            var limite = hoje.AddDays(60);

            // Another one
            //var turmas = await _context.Horarios
            //    .Include(h => h.IdTurmaNavigation)
            //    .Include(h => h.IdCursoModuloNavigation)
            //        .ThenInclude(cm => cm.IdCursoNavigation)
            //    .GroupBy(h => new
            //    {
            //        h.IdTurma,
            //        h.IdTurmaNavigation.NomeTurma,
            //        h.IdCursoModuloNavigation.IdCursoNavigation.Nome
            //    })
            //    .Select(g => new TurmaDecorrerDTO
            //    {
            //        IdTurma = g.Key.IdTurma,
            //        NomeTurma = g.Key.NomeTurma,
            //        NomeCurso = g.Key.Nome,
            //        DataInicio = g.Min(x => x.Data),
            //        DataFim = g.Max(x => x.Data)
            //    })
            //    .Where(t =>
            //        t.DataInicio > hoje &&
            //        t.DataInicio <= limite
            //    )
            //    .OrderBy(t => t.DataInicio)
            //    .ToListAsync();

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

    }
}
