using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO;

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
        public async Task<ActionResult> GetFormadores()
        {
            // Selecionamos apenas o necessário para a lista, evitando carregar BLOBs pesados
            var formadores = await _context.Formadores
                .Include(f => f.IdUtilizadorNavigation)
                .Select(f => new
                {
                    f.IdFormador,
                    Nome = f.IdUtilizadorNavigation.Nome,
                    Email = f.IdUtilizadorNavigation.Email,
                    Nif = f.IdUtilizadorNavigation.Nif,
                    Telefone = f.IdUtilizadorNavigation.Telefone,
                    Qualificacoes = f.Qualificacoes
                })
                .ToListAsync();

            return Ok(formadores);
        }

        // GET: api/Formadores/5
        [HttpGet("{id}")]
        public async Task<ActionResult> GetFormadore(int id)
        {
            var formador = await _context.Formadores
                .Include(f => f.IdUtilizadorNavigation)
                .FirstOrDefaultAsync(f => f.IdFormador == id);

            if (formador == null) return NotFound(new { message = "Formador não encontrado." });

            var resposta = new
            {
                IdFormador = formador.IdFormador,
                IdUtilizador = formador.IdUtilizador,
                Iban = formador.Iban,
                Qualificacoes = formador.Qualificacoes,
                Nome = formador.IdUtilizadorNavigation.Nome,
                Nif = formador.IdUtilizadorNavigation.Nif,
                DataNascimento = formador.IdUtilizadorNavigation.DataNascimento,
                Morada = formador.IdUtilizadorNavigation.Morada,
                Telefone = formador.IdUtilizadorNavigation.Telefone,
                Sexo = formador.IdUtilizadorNavigation.Sexo,
                Email = formador.IdUtilizadorNavigation.Email,
                Fotografia = formador.Fotografia != null
                    ? $"data:image/jpeg;base64,{Convert.ToBase64String(formador.Fotografia)}"
                    : null,
                AnexoFicheiro = formador.AnexoFicheiro != null
                    ? $"data:application/pdf;base64,{Convert.ToBase64String(formador.AnexoFicheiro)}"
                    : null
            };

            return Ok(resposta);
        }

        // POST: api/Formadores
        [HttpPost]
        public async Task<IActionResult> CreateFormador([FromForm] FormadorCreateDTO dto)
        {
            

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var utilizadorExistente = await _context.Utilizadores.FirstOrDefaultAsync(u => u.Email == dto.Email);
                int userId;

                if (utilizadorExistente == null)
                {
                    // Validação nif unico
                    if (await _context.Utilizadores.AnyAsync(u => u.Nif == dto.Nif))
                        return Conflict(new { message = "Este NIF já está registado." });

                    // criar utilizador
                    if (string.IsNullOrEmpty(dto.Password))
                        return BadRequest(new { message = "A password é obrigatória para novos utilizadores." });

                    var novoUtilizador = new Utilizador
                    {
                        Nome = dto.Nome,
                        Nif = dto.Nif,
                        Email = dto.Email,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                        DataNascimento = dto.DataNascimento,
                        Morada = dto.Morada,
                        Telefone = dto.Telefone,
                        Sexo = dto.Sexo,
                        IdTipoUtilizador = 2, // Formador
                        StatusAtivacao = true // ativado por defeito
                    };

                    _context.Utilizadores.Add(novoUtilizador);
                    await _context.SaveChangesAsync();
                    userId = novoUtilizador.IdUtilizador;
                }
                else
                {

                    // Verificar se ele já tem perfil de formador
                    if (await _context.Formadores.AnyAsync(f => f.IdUtilizador == utilizadorExistente.IdUtilizador))
                        return Conflict(new { message = "Este utilizador já tem um perfil de formador ativo." });

                    // Verificar se ele já tem perfil de formando
                    if (await _context.Formandos.AnyAsync(f => f.IdUtilizador == utilizadorExistente.IdUtilizador))
                        return Conflict(new { message = "Este utilizador já tem um perfil de formando ativo, por favor altere o tipo de utilizador na tab utilizador!" });

                    // Alteramos os dados se necessario (ou colocamos os que vao preencher automaticamente os campos)
                    utilizadorExistente.Nome = dto.Nome;
                    utilizadorExistente.Nif = dto.Nif;
                    utilizadorExistente.Telefone = dto.Telefone;
                    utilizadorExistente.DataNascimento = dto.DataNascimento;
                    utilizadorExistente.Morada = dto.Morada;
                    utilizadorExistente.Telefone = dto.Telefone;
                    utilizadorExistente.Sexo = dto.Sexo;
                    // Não trocamos a password e email


                    userId = utilizadorExistente.IdUtilizador;
                }

                // Criar Perfil de Formador vinculado ao userId
                var novoFormador = new Formador
                {
                    IdUtilizador = userId,
                    Iban = dto.Iban,
                    Qualificacoes = dto.Qualificacoes
                };

                // Tratamento de Ficheiros
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
                return Ok(new { message = "Formador registado com sucesso!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = "Erro ao registar formador: " + ex.Message });
            }
        }

        // PUT: api/Formadores/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFormadore(int id, [FromForm] FormadorCreateDTO dto)
        {
            var formador = await _context.Formadores
                .Include(f => f.IdUtilizadorNavigation)
                .FirstOrDefaultAsync(f => f.IdFormador == id);

            if (formador == null) return NotFound(new { message = "Formador não encontrado." });

            // Validar se o NIF/Email já existe em outro utilizador
            bool nifEmUso = await _context.Utilizadores.AnyAsync(u => u.Nif == dto.Nif && u.IdUtilizador != formador.IdUtilizador);
            if (nifEmUso) return Conflict(new { message = "O NIF introduzido já pertence a outro utilizador." });

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Atualizar Utilizador
                var u = formador.IdUtilizadorNavigation;
                u.Nome = dto.Nome;
                u.Nif = dto.Nif;
                u.Telefone = dto.Telefone;
                u.Morada = dto.Morada;
                u.DataNascimento = dto.DataNascimento;
                u.Sexo = dto.Sexo;

                // Atualizar Formador
                formador.Iban = dto.Iban;
                formador.Qualificacoes = dto.Qualificacoes;

                // Atualizar Ficheiros apenas se enviados
                if (dto.Fotografia != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Fotografia.CopyToAsync(ms);
                    formador.Fotografia = ms.ToArray();
                }

                if (dto.Documento != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Documento.CopyToAsync(ms);
                    formador.AnexoFicheiro = ms.ToArray();
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = "Perfil atualizado com sucesso!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = "Erro ao atualizar: " + ex.Message });
            }
        }

        // DELETE: api/Formadores/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFormadore(int id)
        {
            var formador = await _context.Formadores.FindAsync(id);
            if (formador == null) return NotFound();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Nota: Verifique se existem alocações ou horários pendentes antes de apagar
                _context.Formadores.Remove(formador);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return NoContent();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = "Não é possível remover o formador pois existem dados vinculados." });
            }
        }
    }
}