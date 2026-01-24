using Microsoft.AspNetCore.Http;
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
                .Select(t => new TurmaDTO
                {
                    IdTurma = t.IdTurma,
                    NomeTurma = t.NomeTurma,
                    DataInicio = t.DataInicio,
                    DataFim = t.DataFim,
                    IdCurso = t.IdCurso
                })
                .ToListAsync();
        }

        // GET: api/proximasturmas
        [HttpGet("proximasturmas")]
        public async Task<ActionResult<IEnumerable<TurmaDTO>>> GetProximasTurmas()
        {
            var hoje = DateOnly.FromDateTime(DateTime.Now);

            return await _context.Turmas
                .Where(t => t.DataInicio > hoje)
                .OrderBy(t => t.DataInicio)
                .Select(t => new TurmaDTO
                {
                    IdTurma = t.IdTurma,
                    NomeTurma = t.NomeTurma,
                    DataInicio = t.DataInicio,
                    DataFim = t.DataFim,
                    IdCurso = t.IdCurso
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
        public async Task<IActionResult> PutTurma(int id, Turma turma)
        {
            if (id != turma.IdTurma)
            {
                return BadRequest();
            }

            _context.Entry(turma).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TurmaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Turmas
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Turma>> PostTurma(Turma turma)
        {
            _context.Turmas.Add(turma);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTurma", new { id = turma.IdTurma }, turma);
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

        private bool TurmaExists(int id)
        {
            return _context.Turmas.Any(e => e.IdTurma == id);
        }
    }
}
