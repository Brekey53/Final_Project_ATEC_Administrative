using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Crypto;
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
        public async Task<ActionResult<IEnumerable<SalaDTO>>> GetSalas()
        {

            var salas = await _context.Salas.Include(s => s.IdTipoSalaNavigation)
                .Select(s => new SalaDTO
                {
                       IdSala = s.IdSala,
                    Descricao = s.Descricao,
                    NumMaxAlunos = s.NumMaxAlunos,
                    IdTipoSala =  s.IdTipoSalaNavigation.IdTipoSala,
                    TipoSala = s.IdTipoSalaNavigation.Nome
                }
                )
                .OrderBy(s => s.IdSala)
                .ToListAsync();

            return Ok(salas);
        }

        // GET: api/Salas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SalaDTO>> GetSala(int id)
        {
            var sala = await _context.Salas
                .Include(s => s.IdTipoSalaNavigation)
                .Where(s => s.IdSala == id)
                .Select(s => new SalaDTO
                {
                    IdSala = s.IdSala,
                    Descricao = s.Descricao,
                    NumMaxAlunos = s.NumMaxAlunos,
                    IdTipoSala = s.IdTipoSala,
                    TipoSala = s.IdTipoSalaNavigation.Nome
                })
                .FirstOrDefaultAsync();

            if (sala == null)
                return NotFound();

            return Ok(sala);
        }


        // PUT: api/Salas/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSala(int id, SalaDTO salaDto)
        {
            if (id != salaDto.IdSala)
                return BadRequest(new { message = "ID inválido." });

            var sala = await _context.Salas.FindAsync(id);
            if (sala == null)
                return NotFound(new { message = "Sala não encontrada." });

            // validar tipo de sala
            var tipoExiste = await _context.TipoSala
                .AnyAsync(t => t.IdTipoSala == salaDto.IdTipoSala);

            if (!tipoExiste)
                return BadRequest(new { message = "Tipo de sala inválido." });

            // validar descrição duplicada
            var nomeEmUso = await _context.Salas
                .AnyAsync(s => s.Descricao == salaDto.Descricao && s.IdSala != id);

            if (nomeEmUso)
                return Conflict(new { message = "Já existe outra sala com esta descrição." });

            // atualizar
            sala.Descricao = salaDto.Descricao;
            sala.NumMaxAlunos = salaDto.NumMaxAlunos;
            sala.IdTipoSala = salaDto.IdTipoSala;

            await _context.SaveChangesAsync();

            return NoContent();
        }


        // POST: api/Salas
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Sala>> PostSala(SalaDTO salaDto)
        {
            var existe = await _context.Salas
                .AnyAsync(s => s.Descricao == salaDto.Descricao);

            if (existe)
                return Conflict(new { message = "Já existe uma sala com esta descrição." });

            var tipoExiste = await _context.TipoSala
                .AnyAsync(t => t.IdTipoSala == salaDto.IdTipoSala);

            if (!tipoExiste)
                return BadRequest(new { message = "Tipo de sala inválido." });

            var novaSala = new Sala
            {
                Descricao = salaDto.Descricao,
                NumMaxAlunos = salaDto.NumMaxAlunos,
                IdTipoSala = salaDto.IdTipoSala
            };

            _context.Salas.Add(novaSala);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSala), new { id = novaSala.IdSala }, novaSala);
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
