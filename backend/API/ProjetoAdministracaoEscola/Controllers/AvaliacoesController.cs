using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.ModelsDTO;
using System.Security.Claims;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AvaliacoesController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public AvaliacoesController(SistemaGestaoContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("formando")]
        public async Task<ActionResult<IEnumerable<AvaliacaoFormandoDTO>>> GetAvaliacoesFormando()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim);

            var avaliacoes = await _context.Avaliacoes
                .Include(a => a.IdModuloNavigation)
                .Include(a => a.IdInscricaoNavigation)
                    .ThenInclude(i => i.IdFormandoNavigation)
                .Where(a =>
                    a.IdInscricaoNavigation
                     .IdFormandoNavigation
                     .IdUtilizador == userId
                )
                .OrderByDescending(a => a.DataAvaliacao)
                .Select(a => new AvaliacaoFormandoDTO
                {
                    IdAvaliacao = a.IdAvaliacao,
                    NomeModulo = a.IdModuloNavigation.Nome,
                    Nota = a.Nota,
                    DataAvaliacao = a.DataAvaliacao
                })
                .ToListAsync();

            return Ok(avaliacoes);
        }

    }
}
