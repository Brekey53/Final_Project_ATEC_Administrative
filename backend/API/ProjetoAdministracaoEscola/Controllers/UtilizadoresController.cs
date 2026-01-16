using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.Models.ModelsDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UtilizadoresController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public UtilizadoresController(SistemaGestaoContext context)
        {
            _context = context;
        }

        // GET: api/Utilizadores
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Utilizador>>> GetUtilizadores()
        {
            return await _context.Utilizadores.ToListAsync();
        }

        // GET: api/Utilizadores/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Utilizador>> GetUtilizador(int id)
        {
            var utilizador = await _context.Utilizadores.FindAsync(id);

            if (utilizador == null)
            {
                return NotFound();
            }

            return utilizador;
        }

        ///api/utilizadores/perfil
        [HttpGet("perfil")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine(userIdClaim);
            var tipoClaim = User.FindFirst("tipoUtilizador")?.Value;
            Console.WriteLine(tipoClaim);


            if (userIdClaim == null || tipoClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim);
            int tipo = int.Parse(tipoClaim);

            if (tipo == 1 || tipo == 4)
            {
                var user = await _context.Utilizadores.FindAsync(userId);

                if(user == null)
                {
                    return NotFound("Utilizador não encontrado");
                }

                return Ok(new
                {
                    tipo,
                    email = user.Email
                });
            }

            // FORMANDO
            if (tipo == 3)
            {
                var formando = await _context.Formandos
                    .Include(f => f.IdUtilizadorNavigation)
                    .FirstOrDefaultAsync(f => f.IdUtilizador == userId);

                if (formando == null)
                    return NotFound("Formando não encontrado");

                return Ok(new
                {
                    tipo,
                    email = formando.IdUtilizadorNavigation.Email,
                    nome = formando.Nome,
                    nif = formando.Nif,
                    telefone = formando.Phone,
                    dataNascimento = formando.DataNascimento,
                    sexo = formando.Sexo,
                    morada = formando.Morada
                });
            }

            // FORMADOR
            if (tipo == 2)
            {
                var formador = await _context.Formadores
                    .Include(f => f.IdUtilizadorNavigation)
                    .FirstOrDefaultAsync(f => f.IdUtilizador == userId);

                if (formador == null)
                    return NotFound("Formador não encontrado");

                return Ok(new
                {
                    tipo,
                    email = formador.IdUtilizadorNavigation.Email,
                    nome = formador.Nome,
                    nif = formador.Nif,
                    telefone = formador.Phone,
                    dataNascimento = formador.DataNascimento,
                    sexo = formador.Sexo,
                    morada = formador.Morada
                });
            }

            return BadRequest("Tipo de utilizador inválido");
        }

        // PUT: api/Utilizadores/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUtilizador(int id, Utilizador utilizador)
        {
            if (id != utilizador.IdUtilizador)
            {
                return BadRequest();
            }

            _context.Entry(utilizador).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UtilizadorExists(id))
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

        // POST: api/Utilizadores
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Utilizador>> PostUtilizador(UtilizadorRegisterDTO utilizador)
        {

            utilizador.Password = BCrypt.Net.BCrypt.HashPassword(utilizador.Password);

            var newUser = new Utilizador
            {
                Email = utilizador.Email,
                PasswordHash = utilizador.Password,
                IdTipoUtilizador = 5
            };

            _context.Utilizadores.Add(newUser);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUtilizadores", new { id = newUser.IdUtilizador }, newUser);
        }

        // DELETE: api/Utilizadores/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUtilizador(int id)
        {
            var utilizador = await _context.Utilizadores.FindAsync(id);
            if (utilizador == null)
            {
                return NotFound();
            }

            _context.Utilizadores.Remove(utilizador);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UtilizadorExists(int id)
        {
            return _context.Utilizadores.Any(e => e.IdUtilizador == id);
        }

    }
}
