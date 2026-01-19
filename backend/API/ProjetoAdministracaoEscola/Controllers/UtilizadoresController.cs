using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.Models.ModelsDTO;
using ProjetoAdministracaoEscola.ModelsDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Authorize]
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
        public async Task<ActionResult<IEnumerable<UtilizadorDTO>>> GetUtilizadores()
        {
            var utilizadores = await _context.Utilizadores
                .Where(u => u.IdTipoUtilizador == 2 || u.IdTipoUtilizador == 3)
                .Include(u => u.Formadores)
                .Include(u => u.Formandos)
                .Select(u => new UtilizadorDTO
                {
                    UserId = u.IdUtilizador,
                    Email = u.Email,

                    Nome = u.Formadores.Any()
                        ? u.Formadores.First().Nome
                        : u.Formandos.Any()
                            ? u.Formandos.First().Nome
                            : null,

                    Telefone = u.Formadores.Any()
                        ? u.Formadores.First().Phone
                        : u.Formandos.Any()
                            ? u.Formandos.First().Phone
                            : null,

                    Tipo = u.Formadores.Any()
                        ? "Formador"
                        : u.Formandos.Any()
                            ? "Formando"
                            : "Outro"
                })
                .ToListAsync();

            return utilizadores;
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
            var tipoClaim = User.FindFirst("tipoUtilizador")?.Value;

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

        [HttpGet("perfil/foto")]
        public async Task<IActionResult> GetFotoPerfil()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var tipoClaim = User.FindFirst("tipoUtilizador")?.Value;

            if (userIdClaim == null || tipoClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim);
            int tipo = int.Parse(tipoClaim);

            // FORMANDO
            if (tipo == 3)
            {
                var formando = await _context.Formandos
                    .Where(f => f.IdUtilizador == userId)
                    .Select(f => f.Fotografia)
                    .FirstOrDefaultAsync();

                if (formando == null)
                    return NotFound();

                return File(formando, "image/jpeg");
            }

            // FORMADOR
            if (tipo == 2)
            {
                var formador = await _context.Formadores
                    .Where(f => f.IdUtilizador == userId)
                    .Select(f => f.Fotografia)
                    .FirstOrDefaultAsync();

                if (formador == null)
                    return NotFound();

                return File(formador, "image/jpeg");
            }

            // Outros tipos não têm foto
            return NotFound();
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
        [Authorize(Policy = "AdminOrAdministrativo")]
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

        [HttpGet("check-email")]
        public async Task<IActionResult> CheckEmail(string email)
        {
            var existe = await _context.Utilizadores.AnyAsync(u => u.Email == email);
            return Ok(new { existe });
        }

        private bool UtilizadorExists(int id)
        {
            return _context.Utilizadores.Any(e => e.IdUtilizador == id);
        }

    }
}
