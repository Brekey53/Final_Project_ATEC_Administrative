using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO;
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

            var turmas = await _context.Horarios
                .Where(h => h.IdFormador == formadorId)
                .Select(h => new TurmaFormadorDTO
                {
                    IdTurma = h.IdTurma,
                    IdModulo = h.IdCursoModuloNavigation.IdModulo,
                    NomeTurma = h.IdTurmaNavigation.NomeTurma,
                    NomeModulo = h.IdCursoModuloNavigation.IdModuloNavigation.Nome,
                    DataInicio = h.IdTurmaNavigation.DataInicio,
                    DataFim = h.IdTurmaNavigation.DataFim,
                    IdCurso = h.IdTurmaNavigation.IdCurso
                })
                .Distinct()
                .OrderBy(t => t.DataInicio)
                .ToListAsync();

            return Ok(turmas);
        }

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



    }
}
