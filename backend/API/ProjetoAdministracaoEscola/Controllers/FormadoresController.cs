using Humanizer;
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
    [Authorize(Policy = "AdminOrAdministrativo")]
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

            var formador = await _context.Formadores
                .Include(f => f.IdUtilizadorNavigation)
                .FirstOrDefaultAsync(f => f.IdFormador == id);

            if (formador == null)
            {
                return NotFound();
            }

            var respostaFormador = new
            {
                IdFormador = formador.IdFormador,
                IdUtilizador = formador.IdUtilizador,
                Nome = formador.Nome,
                Nif = formador.Nif,
                Phone = formador.Phone,
                DataNascimento = formador.DataNascimento,
                Sexo = formador.Sexo,
                Morada = formador.Morada,
                Email = formador.IdUtilizadorNavigation?.Email,
                Fotografia = formador.Fotografia != null
                    ? $"data:image/jpeg;base64,{Convert.ToBase64String(formador.Fotografia)}"
                    : null,
                // Documento (PDF/DOC/DOCX) - prefixo genérico para ficheiros
                AnexoFicheiro = formador.AnexoFicheiro != null
                    ? $"data:application/pdf;base64,{Convert.ToBase64String(formador.AnexoFicheiro)}"
                    : null
            };
            return Ok(respostaFormador);
        }

        // PUT: api/Formadores/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFormadore(int id, [FromForm] FormadorCreateDTO dto)
        {
            // Verificar se o NIF já pertence a OUTRO formador
            bool nifEmUso = await _context.Formadores.AnyAsync(f => f.Nif == dto.Nif && f.IdFormador != id);
            if (nifEmUso)
            {
                return Conflict(new { message = "O NIF introduzido já pertence a outro formador." });
            }

            var formadorExistente = await _context.Formadores.FindAsync(id);

            if (formadorExistente == null)
            {
                return NotFound(new { message = "Formador não encontrado." });
            }

            try
            {
                // Atualizar dados básicos
                formadorExistente.Nome = dto.Nome;
                formadorExistente.Nif = dto.Nif;
                formadorExistente.Phone = dto.Telefone;
                formadorExistente.DataNascimento = dto.DataNascimento;
                formadorExistente.Morada = dto.Morada;
                formadorExistente.Sexo = dto.Sexo;

                // Atualizar Ficheiros (Substitui apenas se vierem novos ficheiros no FormData)
                if (dto.Fotografia != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Fotografia.CopyToAsync(ms);
                    formadorExistente.Fotografia = ms.ToArray();
                }

                if (dto.Documento != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Documento.CopyToAsync(ms);
                    formadorExistente.AnexoFicheiro = ms.ToArray();
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Perfil de formador atualizado com sucesso!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Erro ao atualizar: " + (ex.InnerException?.Message ?? ex.Message) });
            }
        }

        // POST: api/Formadores
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<IActionResult> CreateFormador([FromForm] FormadorCreateDTO dto)
        {
            // Verificar se o NIF já existe na tabela de Formadores
            if (await _context.Formadores.AnyAsync(f => f.Nif == dto.Nif))
            {
                return Conflict(new { message = "Este NIF já se encontra registado para um formador." });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var user = await _context.Utilizadores.FirstOrDefaultAsync(u => u.Email == dto.Email);

                // Se o utilizador não existe, criamos um novo com Tipo 2 (Formador)
                if (user == null)
                {
                    user = new Utilizador
                    {
                        Email = dto.Email,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                        IdTipoUtilizador = 2, // 2 = Formador
                        StatusAtivacao = true
                    };
                    _context.Utilizadores.Add(user);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    // Se o utilizador já existe, verificamos se já tem perfil de formador
                    if (await _context.Formadores.AnyAsync(f => f.IdUtilizador == user.IdUtilizador))
                    {
                        return Conflict(new { message = "Este email já está associado a um formador existente." });
                    }
                }

                // Criar o Perfil do Formador
                var novoFormador = new Formadore
                {
                    IdUtilizador = user.IdUtilizador,
                    Nome = dto.Nome,
                    Nif = dto.Nif,
                    Phone = dto.Telefone,
                    DataNascimento = dto.DataNascimento,
                    Morada = dto.Morada,
                    Sexo = dto.Sexo
                };

                // Tratamento de Ficheiros (BLOB)
                if (dto.Fotografia != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Fotografia.CopyToAsync(ms);
                    novoFormador.Fotografia = ms.ToArray();
                }

                if (dto.Documento != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Documento.CopyToAsync(ms);
                    novoFormador.AnexoFicheiro = ms.ToArray();
                }

                _context.Formadores.Add(novoFormador);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return Ok(new { message = "Formador criado com sucesso!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = "Erro ao registar formador: " + ex.Message });
            }
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
