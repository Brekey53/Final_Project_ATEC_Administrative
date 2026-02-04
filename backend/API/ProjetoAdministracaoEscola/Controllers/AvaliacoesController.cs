using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.ModelsDTO.Avaliacao;
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
            if (userIdClaim == null) 
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            var formando = await _context.Formandos
                .FirstOrDefaultAsync(f => f.IdUtilizador == userId);

            if (formando == null) 
                return NotFound("Formando não encontrado.");

            var inscricao = await _context.Inscricoes
                .Include(i => i.IdTurmaNavigation)
                .FirstOrDefaultAsync(i => i.IdFormando == formando.IdFormando);

            if (inscricao == null)
                return Ok(new List<AvaliacaoFormandoDTO>());

 
            int idCurso = inscricao.IdTurmaNavigation.IdCurso;


            var totalModulosCurso = await _context.CursosModulos
                .CountAsync(cm => cm.IdCurso == idCurso);

            var avaliacoes = await _context.Avaliacoes
                .Where(a => a.IdInscricaoNavigation.IdFormando == formando.IdFormando)
                .OrderByDescending(a => a.DataAvaliacao)
                .Select(a => new AvaliacaoFormandoDTO
                {
                    IdAvaliacao = a.IdAvaliacao,
                    NomeModulo = a.IdModuloNavigation.Nome,
                    Nota = a.Nota,
                    DataAvaliacao = a.DataAvaliacao,
                    TotalModulosCurso = totalModulosCurso
                })
                .ToListAsync();

            return Ok(avaliacoes);
        }

    }
}
