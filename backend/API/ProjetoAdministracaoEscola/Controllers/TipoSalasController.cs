using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.ModelsDTO;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoSalasController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public TipoSalasController(SistemaGestaoContext context)
        {
            _context = context;
        }

        // GET: api/tipo-salas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoSalaDTO>>> GetTipoSalas()
        {
            var tipos = await _context.TipoSala
                .OrderBy(ts => ts.Nome)
                .Select(ts => new TipoSalaDTO
                {
                    IdTipoSala = ts.IdTipoSala,
                    Nome = ts.Nome
                })
                .ToListAsync();

            return Ok(tipos);
        }
    }
}

