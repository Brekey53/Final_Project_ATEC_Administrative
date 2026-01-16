using Humanizer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FormandosController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;
        private readonly IConfiguration _configuration;

        public FormandosController(SistemaGestaoContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/Formandos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FormandoDto>>> GetFormandos()
        {
            var formandos = await _context.Formandos.Select(f => new FormandoDto
            {
                IdFormando = f.IdFormando,
                Nome = f.Nome,
                Email = f.IdUtilizadorNavigation.Email, //a chave estrangeira tem esse nome
                Phone = f.Phone
            }).ToListAsync();

            return Ok(formandos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetFormando(int id)
        {
            // É importante usar o Include para garantir que o Email (IdUtilizadorNavigation) não venha nulo
            var formando = await _context.Formandos
                .Include(f => f.IdUtilizadorNavigation)
                .FirstOrDefaultAsync(f => f.IdFormando == id);

            if (formando == null)
            {
                return NotFound();
            }

            var respostaFormando = new
            {
                IdFormando = formando.IdFormando,
                IdUtilizador = formando.IdUtilizador,
                Nome = formando.Nome,
                Nif = formando.Nif,
                Phone = formando.Phone,
                DataNascimento = formando.DataNascimento,
                Sexo = formando.Sexo,
                Morada = formando.Morada,
                Email = formando.IdUtilizadorNavigation?.Email,
                Fotografia = formando.Fotografia != null
                    ? $"data:image/jpeg;base64,{Convert.ToBase64String(formando.Fotografia)}"
                    : null,
                // Documento (PDF/DOC/DOCX) - prefixo genérico para ficheiros
                AnexoFicheiro = formando.AnexoFicheiro != null
                    ? $"data:application/octet-stream;base64,{Convert.ToBase64String(formando.AnexoFicheiro)}"
                    : null
            };
            return Ok(respostaFormando);
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


        [HttpPost("completo")]
        public async Task<IActionResult> CreateFormando([FromForm] FormandoCompletoDTO dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Criar o Utilizador
                var novoUtilizador = new Utilizador
                {
                    Email = dto.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    IdTipoUtilizador = 3,
                    StatusAtivacao = true
                };
                _context.Utilizadores.Add(novoUtilizador);
                await _context.SaveChangesAsync();

                // 2. Criar o Perfil do Formando
                var novoFormando = new Formando
                {
                    IdUtilizador = novoUtilizador.IdUtilizador,
                    Nome = dto.Nome,
                    Nif = dto.Nif,
                    Phone = dto.Telefone, // Mapeado para 'Phone' da tua Entidade
                    DataNascimento = dto.DataNascimento,
                    Morada = dto.Morada,
                    Sexo = dto.Sexo
                };

                // Conversão BLOB (MemoryStream)
                if (dto.Fotografia != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Fotografia.CopyToAsync(ms);
                    novoFormando.Fotografia = ms.ToArray();
                }

                if (dto.Documento != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Documento.CopyToAsync(ms);
                    novoFormando.AnexoFicheiro = ms.ToArray();
                }

                _context.Formandos.Add(novoFormando);
                await _context.SaveChangesAsync();

                // 3. Criar Inscrição (se houver turma)
                if (dto.IdTurma.HasValue && dto.IdTurma > 0)
                {
                    // Usando 'Inscrico' conforme definido no teu scaffold/modelo
                    var novaInscricao = new Inscrico
                    {
                        IdFormando = novoFormando.IdFormando,
                        IdTurma = dto.IdTurma.Value,
                        DataInscricao = DateOnly.FromDateTime(DateTime.Now),
                        Estado = "Ativo"
                    };
                    _context.Inscricoes.Add(novaInscricao);
                    await _context.SaveChangesAsync();
                }

                // IMPORTANTE: Confirmar as alterações na BD
                await transaction.CommitAsync();

                return Ok(new { message = "Formando criado com sucesso!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                // Log detalhado para ajudar a encontrar erros de SQL (ex: NIF duplicado)
                return BadRequest(new { message = "Erro ao guardar: " + ex.InnerException?.Message ?? ex.Message });
            }
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
