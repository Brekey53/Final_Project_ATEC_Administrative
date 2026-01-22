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
    public class SalasController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public SalasController(SistemaGestaoContext context)
        {
            _context = context;
        }

        // GET: api/Salas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sala>>> GetSalas()
        {
            return await _context.Salas.ToListAsync();
        }

        // GET: api/Salas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Sala>> GetSala(int id)
        {
            var sala = await _context.Salas.FindAsync(id);

            if (sala == null)
            {
                return NotFound();
            }

            return sala;
        }

        // PUT: api/Salas/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSala(int id, SalaDTO salaDto)
        {
            if (id != salaDto.IdSala)
            {
                return BadRequest(new { message = "O ID da URL não coincide com o ID da sala enviada." });
            }

            // Procurar a sala original
            var salaOriginal = await _context.Salas.FindAsync(id);
            if (salaOriginal == null)
            {
                return NotFound(new { message = "Sala não encontrada." });
            }

            // Validar se a nova descrição já existe noutra sala (excluindo a atual)
            var nomeEmUso = await _context.Salas
                .AnyAsync(s => s.Descricao == salaDto.Descricao && s.IdSala != id);

            if (nomeEmUso)
            {
                return Conflict(new { message = "Já existe outra sala com esta descrição." });
            }

            // Atualizar campos explicitamente
            salaOriginal.Descricao = salaDto.Descricao;
            salaOriginal.NumMaxAlunos = salaDto.NumMaxAlunos;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SalaExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // POST: api/Salas
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Sala>> PostSala(SalaDTO salaDto)
        {
            // Validar se já existe uma sala
            var existe = await _context.Salas.AnyAsync(s => s.Descricao == salaDto.Descricao);
            if (existe)
            {
                return Conflict(new { message = $"Já existe uma sala registada como '{salaDto.Descricao}'." });
            }

            // Mapear DTO para Entidade
            var novaSala = new Sala
            {
                Descricao = salaDto.Descricao,
                NumMaxAlunos = salaDto.NumMaxAlunos
            };

            _context.Salas.Add(novaSala);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSala", new { id = novaSala.IdSala }, novaSala);
        }

        // DELETE: api/Salas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSala(int id)
        {
            var sala = await _context.Salas.FindAsync(id);
            if (sala == null)
            {
                return NotFound();
            }

            _context.Salas.Remove(sala);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SalaExists(int id)
        {
            return _context.Salas.Any(e => e.IdSala == id);
        }
    }
}
