using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.ModelsDTO.Curso;
using ProjetoAdministracaoEscola.ModelsDTO.Turma;

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
                TurmasConcluidas = await GetTurmasConcluidas(),
                FormandosAtivos = await _context.Formandos.CountAsync(),
                Formadores = await _context.Formadores.CountAsync(),
                Salas = await _context.Salas.CountAsync(),
                Modulos = await _context.Modulos.CountAsync()
            };

            return Ok(stats);
        }
        private async Task<int> GetTurmasConcluidas()
        {
            var hoje = DateOnly.FromDateTime(DateTime.Now);
            return await _context.Turmas.CountAsync(t => t.DataFim <= hoje);
        }



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
