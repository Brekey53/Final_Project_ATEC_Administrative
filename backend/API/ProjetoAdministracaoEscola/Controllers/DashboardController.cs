using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProjetoAdministracaoEscola.Data;
using Microsoft.EntityFrameworkCore;

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
            // Contagens rápidas e eficientes usando CountAsync
            var stats = new
            {
                // Altera esta linha no teu DashboardController:
                CursosDecorrer = await _context.Turmas.CountAsync(t => t.DataFim > DateOnly.FromDateTime(DateTime.Now)),
                TotalCursos = await _context.Cursos.CountAsync(),
                FormandosAtivos = await _context.Formandos.CountAsync(),
                Formadores = await _context.Formadores.CountAsync(),
                Salas = await _context.Salas.CountAsync(),
                Modulos = await _context.Modulos.CountAsync()
            };

            return Ok(stats);
        }
    }
}
