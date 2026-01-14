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
    public class FormandosController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public FormandosController(SistemaGestaoContext context)
        {
            _context = context;
        }

        // GET: api/Formandos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FormandoDto>>> GetFormandos()
        {
            var formandos = await _context.Formandos.Select(f => new FormandoDto
            {
                IdFormando = f.IdFormando,
                Nome = f.Nome,
                Email = f.IdUtilizadorNavigation.Email //a chave estrangeira tem esse nome
            }).ToListAsync();

            return Ok(formandos);
        }

        // GET: api/Formandos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Formando>> GetFormando(int id)
        {
            var formando = await _context.Formandos.FindAsync(id);

            if (formando == null)
            {
                return NotFound();
            }

            return formando;
        }

        // PUT: api/Formandos/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFormando(int id, Formando formando)
        {
            if (id != formando.IdFormando)
            {
                return BadRequest();
            }

            _context.Entry(formando).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FormandoExists(id))
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

        // POST: api/Formandos
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Formando>> PostFormando(Formando formando)
        {
            _context.Formandos.Add(formando);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetFormando", new { id = formando.IdFormando }, formando);
        }

        // DELETE: api/Formandos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFormando(int id)
        {
            var formando = await _context.Formandos.FindAsync(id);
            if (formando == null)
            {
                return NotFound();
            }

            _context.Formandos.Remove(formando);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FormandoExists(int id)
        {
            return _context.Formandos.Any(e => e.IdFormando == id);
        }
    }
}
