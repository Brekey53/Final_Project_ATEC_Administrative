using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Models;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FormadoresController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public FormadoresController(SistemaGestaoContext context)
        {
            _context = context;
        }

        // GET: api/Formadores
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Formadore>>> GetFormadores()
        {
            return await _context.Formadores.ToListAsync();
        }

        // GET: api/Formadores/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Formadore>> GetFormadore(int id)
        {
            var formadore = await _context.Formadores.FindAsync(id);

            if (formadore == null)
            {
                return NotFound();
            }

            return formadore;
        }

        // PUT: api/Formadores/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFormadore(int id, Formadore formadore)
        {
            if (id != formadore.IdFormador)
            {
                return BadRequest();
            }

            _context.Entry(formadore).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FormadoreExists(id))
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

        // POST: api/Formadores
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Formadore>> PostFormadore(Formadore formadore)
        {
            _context.Formadores.Add(formadore);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetFormadore", new { id = formadore.IdFormador }, formadore);
        }

        // DELETE: api/Formadores/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFormadore(int id)
        {
            var formadore = await _context.Formadores.FindAsync(id);
            if (formadore == null)
            {
                return NotFound();
            }

            _context.Formadores.Remove(formadore);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FormadoreExists(int id)
        {
            return _context.Formadores.Any(e => e.IdFormador == id);
        }
    }
}
