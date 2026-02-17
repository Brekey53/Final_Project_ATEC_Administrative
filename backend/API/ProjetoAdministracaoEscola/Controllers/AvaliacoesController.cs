using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.ModelsDTO.Avaliacao.Responses;
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

        /// <summary>
        /// Obtém a lista de avaliações associadas ao formando.
        /// </summary>
        /// <remarks>
        /// Este endpoint identifica o utilizador autenticado através do claim NameIdentifier,
        /// verifica se está associado a um registo de formando e devolve todas as avaliações
        /// correspondentes à sua inscrição.
        /// 
        /// Caso o formando não tenha inscrição ativa, é devolvida uma lista vazia.
        /// </remarks>
        /// <returns>
        /// 200 OK com a lista de avaliações do formando;
        /// 401 Unauthorized se o utilizador não estiver autenticado;
        /// 404 NotFound se o utilizador autenticado não estiver associado a um formando.
        /// </returns>
        [Authorize(Policy = "Formando")]
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
