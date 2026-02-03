using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EscolaridadesController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public EscolaridadesController(SistemaGestaoContext context)
        {
            _context = context;
        }

        // GET: api/Escolaridades
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Escolaridade>>> GetEscolaridades()
        {
            return await _context.Escolaridades.ToListAsync();
        }

        // GET: api/Escolaridades/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Escolaridade>> GetEscolaridade(int id)
        {
            var escolaridade = await _context.Escolaridades.FindAsync(id);

            if (escolaridade == null)
            {
                return NotFound();
            }

            return escolaridade;
        }

        // PUT: api/Escolaridades/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEscolaridade(int id, Escolaridade escolaridade)
        {
            if (id != escolaridade.IdEscolaridade)
            {
                return BadRequest();
            }

            _context.Entry(escolaridade).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EscolaridadeExists(id))
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

        // POST: api/Escolaridades
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Escolaridade>> PostEscolaridade(Escolaridade escolaridade)
        {
            _context.Escolaridades.Add(escolaridade);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEscolaridade", new { id = escolaridade.IdEscolaridade }, escolaridade);
        }

        // DELETE: api/Escolaridades/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEscolaridade(int id)
        {
            var escolaridade = await _context.Escolaridades.FindAsync(id);
            if (escolaridade == null)
            {
                return NotFound();
            }

            _context.Escolaridades.Remove(escolaridade);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EscolaridadeExists(int id)
        {
            return _context.Escolaridades.Any(e => e.IdEscolaridade == id);
        }
    }
}
