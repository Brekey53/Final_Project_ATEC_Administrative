using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.ModelsDTO.Sala.Responses;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TipoSalasController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public TipoSalasController(SistemaGestaoContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém a lista de todos os tipos de sala.
        /// </summary>
        /// <remarks>
        /// Os tipos de sala são devolvidos ordenados alfabeticamente pelo nome.
        /// </remarks>
        /// <returns>
        /// Lista de <see cref="TipoSalaDTO"/>.
        /// </returns>
        /// <response code="200">Lista de tipos de sala devolvida com sucesso.</response>
        // GET: api/tipo-salas
        [Authorize(Policy = "AdminOrAdministrativo")]
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

