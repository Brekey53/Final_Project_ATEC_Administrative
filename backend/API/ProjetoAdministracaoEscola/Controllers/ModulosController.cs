using Microsoft.AspNetCore.Authorization;
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
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ModulosController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public ModulosController(SistemaGestaoContext context)
        {
            _context = context;
        }

        // GET: api/Modulos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Modulo>>> GetModulos()
        {
            return await _context.Modulos.ToListAsync();
        }

        // GET: api/Modulos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Modulo>> GetModulo(int id)
        {
            var modulo = await _context.Modulos.FindAsync(id);

            if (modulo == null)
            {
                return NotFound();
            }

            return modulo;
        }

        // PUT: api/Modulos/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutModulo(int id, Modulo modulo)
        {
            if (id != modulo.IdModulo)
            {
                return BadRequest();
            }

            _context.Entry(modulo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ModuloExists(id))
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

        // POST: api/Modulos
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPost]
        public async Task<ActionResult<Modulo>> PostModulo(NewModuloDTO moduloDto)
        {

            if (string.IsNullOrWhiteSpace(moduloDto.Nome) || string.IsNullOrWhiteSpace(moduloDto.CodigoIdentificacao))
            {
                return BadRequest(new { message = "O nome e o código de identificação são obrigatórios." });
            }

            if (moduloDto.HorasTotais <= 0)
            {
                return BadRequest(new { message = "A carga horária deve ser superior a 0 horas." });
            }

            if (moduloDto.Creditos < 0)
            {
                return BadRequest(new { message = "Os créditos não podem ser valores negativos." });
            }

            var exist = await _context.Modulos.AnyAsync(m => m.CodigoIdentificacao == moduloDto.CodigoIdentificacao);

            if (exist)
            {
                return Conflict(new { message = $"O código '{moduloDto.CodigoIdentificacao}' já está em uso." });
            }

            var novoModulo = new Modulo
            {
                Nome = moduloDto.Nome,
                CodigoIdentificacao = moduloDto.CodigoIdentificacao,
                HorasTotais = moduloDto.HorasTotais,
                Creditos = moduloDto.Creditos
            };


            try
            {
                _context.Modulos.Add(novoModulo);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetModulo", new { id = novoModulo.IdModulo }, novoModulo);
            }
            catch (DbUpdateException)
            {
                // Erro genérico de base de dados
                return StatusCode(500, new { message = "Erro ao guardar no servidor. Tente novamente mais tarde." });
            }
        }

        // DELETE: api/Modulos/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteModulo(int id)
        {
            var modulo = await _context.Modulos.FindAsync(id);
            if (modulo == null)
            {
                return NotFound();
            }

            _context.Modulos.Remove(modulo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ModuloExists(int id)
        {
            return _context.Modulos.Any(e => e.IdModulo == id);
        }
    }
}
