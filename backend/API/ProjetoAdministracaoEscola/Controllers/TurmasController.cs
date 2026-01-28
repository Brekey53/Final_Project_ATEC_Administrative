using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TurmasController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public TurmasController(SistemaGestaoContext context)
        {
            _context = context;
        }

        // GET: api/Turmas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TurmaDTO>>> GetTurmas()
        {
            return await _context.Turmas
                .Include(t => t.IdCursoNavigation)
                .Select(t => new TurmaDTO
                {
                    IdTurma = t.IdTurma,
                    NomeTurma = t.NomeTurma,
                    DataInicio = t.DataInicio,
                    DataFim = t.DataFim,
                    IdCurso = t.IdCurso,
                    NomeCurso = t.IdCursoNavigation.Nome,
                    Estado = CalcularEstadoTurma(t.DataInicio, t.DataFim)
                })
                .ToListAsync();
        }

        // GET: api/proximasturmas
        [HttpGet("proximasturmas")]
        public async Task<ActionResult<IEnumerable<TurmaDTO>>> GetProximasTurmas()
        {
            var hoje = DateOnly.FromDateTime(DateTime.Now);

            return await _context.Turmas
                //.Include(t => t.IdCursoNavigation.Nome)
                .Where(t => t.DataInicio > hoje)
                .OrderBy(t => t.DataInicio)
                .Select(t => new TurmaDTO
                {
                    IdTurma = t.IdTurma,
                    NomeTurma = t.NomeTurma,
                    DataInicio = t.DataInicio,
                    DataFim = t.DataFim,
                    IdCurso = t.IdCurso,
                    NomeCurso = t.IdCursoNavigation.Nome
                })
                .ToListAsync();
        }


        // GET: api/Turmas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Turma>> GetTurma(int id)
        {
            var turma = await _context.Turmas.FindAsync(id);

            if (turma == null)
            {
                return NotFound();
            }

            return turma;
        }

        // PUT: api/Turmas/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTurma(int id, TurmaDTO turmadto)
        {
            var turma = await _context.Turmas.FirstOrDefaultAsync(t => t.IdTurma == id);

            if (turma == null)
            {
                return BadRequest(new { message = "Erro ao carregar a turma." });
            }
            turma.IdTurma = turmadto.IdTurma;
            turma.NomeTurma = turmadto.NomeTurma;
            turma.DataInicio = turmadto.DataInicio;
            turma.DataFim = turmadto.DataFim;
            turma.IdCurso = turmadto.IdCurso;            

            await _context.SaveChangesAsync();

            return Ok(new { message = "Dados atualizados com sucesso!" });
        }

        // POST: api/Turmas
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<IActionResult> PostTurma([FromForm] TurmaDTO turmadto)
        {
            var turmaExistente = await _context.Turmas.FirstOrDefaultAsync(t => t.NomeTurma == turmadto.NomeTurma);
            

            if (turmaExistente != null)
            {
                return BadRequest(new { message = "Já existe uma turma com esse nome!" });
            }
            try
            {
                var novaTurma = new Turma
                {
                    NomeTurma = turmadto.NomeTurma,
                    DataInicio = turmadto.DataInicio,
                    DataFim = turmadto.DataFim,
                    IdCurso = turmadto.IdCurso,
                    //NomeCurso = turmadto.NomeCurso
                };

                _context.Turmas.Add(novaTurma);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Turma registada com sucesso!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Erro ao salvar na base de dados: " + ex.Message });
            }


        }

        // DELETE: api/Turmas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTurma(int id)
        {
            var turma = await _context.Turmas.FindAsync(id);
            if (turma == null)
            {
                return NotFound();
            }

            _context.Turmas.Remove(turma);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static string CalcularEstadoTurma(DateOnly dataInicio, DateOnly dataFim)
        {
            var hoje = DateOnly.FromDateTime(DateTime.Today);

            if (hoje < dataInicio)
                return "Para começar";

            if (hoje > dataFim)
                return "Terminada";

            return "A decorrer";
        }


        private bool TurmaExists(int id)
        {
            return _context.Turmas.Any(e => e.IdTurma == id);
        }
    }
}
