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
        public async Task<ActionResult<IEnumerable<object>>> GetUtilizadores()
        {
            return await _context.Utilizadores
                .Include(u => u.IdTipoUtilizadorNavigation)
                .Select(u => new
                {
                    idUtilizador = u.IdUtilizador,
                    nome = u.Nome,
                    email = u.Email,
                    telefone = u.Telefone,
                    nif = u.Nif,
                    tipoUtilizador = u.IdTipoUtilizadorNavigation.TipoUtilizador // Admin, Formador, Formando, Administrativo, Geral
                })
                .ToListAsync();
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
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim);

            // Procuramos o utilizador e incluímos os perfis específicos se existirem
            var user = await _context.Utilizadores
                .Include(u => u.Formadores)
                .Include(u => u.Formandos)
                .FirstOrDefaultAsync(u => u.IdUtilizador == userId);

            if (user == null) return NotFound("Utilizador não encontrado");

            // Dados comuns a todos os perfis
            var perfilBase = new
            {
                user.IdTipoUtilizador,
                user.Email,
                user.Nome,
                user.Nif,
                user.Telefone,
                user.DataNascimento,
                user.Sexo,
                user.Morada,
                user.StatusAtivacao
            };

            // Adicionar dados específicos se for Formando (Tipo 3) ou Formador (Tipo 2)
            if (user.IdTipoUtilizador == 3 && user.Formandos.Any())
            {
                var f = user.Formandos.First();
                return Ok(new { baseInfo = perfilBase, extra = new { f.IdFormando, f.IdEscolaridade } });
            }

            if (user.IdTipoUtilizador == 2 && user.Formadores.Any())
            {
                var f = user.Formadores.First();
                return Ok(new { baseInfo = perfilBase, extra = new { f.IdFormador, f.Iban, f.Qualificacoes } });
            }

            return Ok(perfilBase);
        }

        [HttpGet("perfil/foto")]
        public async Task<IActionResult> GetFotoPerfil()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim);

            var foto = await _context.Formandos
                .Where(f => f.IdUtilizador == userId)
                .Select(f => f.Fotografia)
                .FirstOrDefaultAsync()
                ?? await _context.Formadores
                .Where(f => f.IdUtilizador == userId)
                .Select(f => f.Fotografia)
                .FirstOrDefaultAsync();

            if (foto == null) return NotFound();

            return File(foto, "image/jpeg");
        }


        // PUT: api/Utilizadores/5
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> PutUtilizador(int id, [FromForm] UtilizadorUpdateDTO dto)
        {
            var user = await _context.Utilizadores.FindAsync(id);
            if (user == null) return NotFound();

            user.Nome = dto.Nome;
            user.Telefone = dto.Telefone;
            user.Morada = dto.Morada;
            user.Sexo = dto.Sexo;
            user.DataNascimento = dto.DataNascimento;
            user.IdTipoUtilizador = dto.IdTipoUtilizador;

            await _context.SaveChangesAsync();
            return NoContent();
        }


        // POST: api/Utilizadores
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult> PostUtilizador(UtilizadorRegisterDTO dto)
        {
            if (await _context.Utilizadores.AnyAsync(u => u.Email == dto.Email))
                return Conflict("Email já registado");

            var newUser = new Utilizador
            {
                Nome = dto.Nome,
                Nif = dto.Nif,
                DataNascimento = dto.DataNascimento,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                IdTipoUtilizador = 5, // criar como geral
                Email = dto.Email,
                StatusAtivacao = false
            };

            _context.Utilizadores.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Utilizador registado com sucesso", userId = newUser.IdUtilizador });
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
        [AllowAnonymous]
        public async Task<IActionResult> CheckEmail(string email)
        {
            var existe = await _context.Utilizadores.AnyAsync(u => u.Email == email);
            return Ok(new { existe });
        }

        [HttpGet("details-by-email")]
        public async Task<IActionResult> GetUserDetails(string email)
        {
            var user = await _context.Utilizadores
                .Select(u => new {
                    u.Email,
                    u.Nome,
                    u.Nif,
                    u.DataNascimento,
                    u.Telefone,
                    u.Sexo,
                    u.Morada,
                    Existe = true
                })
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null) return Ok(new { Existe = false });

            return Ok(user);
        }

        private bool UtilizadorExists(int id)
        {
            return _context.Utilizadores.Any(e => e.IdUtilizador == id);
        }

    }
}
