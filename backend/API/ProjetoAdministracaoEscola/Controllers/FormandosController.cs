using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FormandosController : ControllerBase
    {
        private readonly SistemaGestaoContext _context;

        public FormandosController(SistemaGestaoContext context)
        {
            _context = context;
        }

        // GET: api/Formandos
        // Retorna a lista simplificada para a tabela/grid
        [HttpGet]
        public async Task<ActionResult> GetFormandos()
        {
            var formandos = await _context.Formandos
                .Include(f => f.IdUtilizadorNavigation)
                .Select(f => new
                {
                    f.IdFormando,
                    Nome = f.IdUtilizadorNavigation.Nome,
                    Email = f.IdUtilizadorNavigation.Email,
                    Nif = f.IdUtilizadorNavigation.Nif,
                    Telefone = f.IdUtilizadorNavigation.Telefone,
                    Status = f.IdUtilizadorNavigation.StatusAtivacao
                })
                .ToListAsync();

            return Ok(formandos);
        }

        // GET: api/Formandos/5
        [HttpGet("{id}")]
        public async Task<ActionResult> GetFormando(int id)
        {
            var formando = await _context.Formandos
                .Include(f => f.IdUtilizadorNavigation)
                .Include(f => f.IdEscolaridadeNavigation)
                .FirstOrDefaultAsync(f => f.IdFormando == id);

            if (formando == null)
                return NotFound(new { message = "Formando não encontrado!" });

            var resposta = new
            {
                IdFormando = formando.IdFormando,
                IdUtilizador = formando.IdUtilizador,
                Nome = formando.IdUtilizadorNavigation.Nome,
                Nif = formando.IdUtilizadorNavigation.Nif,
                DataNascimento = formando.IdUtilizadorNavigation.DataNascimento,
                Morada = formando.IdUtilizadorNavigation.Morada,
                Telefone = formando.IdUtilizadorNavigation.Telefone,
                Sexo = formando.IdUtilizadorNavigation.Sexo,
                Email = formando.IdUtilizadorNavigation.Email,
                IdEscolaridade = formando.IdEscolaridade,
                EscolaridadeNivel = formando.IdEscolaridadeNavigation?.Nivel,
                Fotografia = formando.Fotografia != null ? $"data:image/jpeg;base64,{Convert.ToBase64String(formando.Fotografia)}" : null,
                AnexoFicheiro = formando.AnexoFicheiro != null ? $"data:application/pdf;base64,{Convert.ToBase64String(formando.AnexoFicheiro)}" : null
            };

            return Ok(resposta);
        }

        // POST: api/Formandos/completo
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPost("completo")]
        public async Task<IActionResult> CreateFormando([FromForm] FormandoCompletoDTO dto)
        {
            // Verificações de unicidade na tabela UTILIZADORES
            if (await _context.Utilizadores.AnyAsync(u => u.Email == dto.Email))
                return Conflict(new { message = "Este Email já está registado." });

            if (await _context.Utilizadores.AnyAsync(u => u.Nif == dto.Nif))
                return Conflict(new { message = "Este NIF já está registado." });

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Criar Utilizador base
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
                    IdTipoUtilizador = 3, // Formando
                    StatusAtivacao = true
                };

                _context.Utilizadores.Add(novoUtilizador);
                await _context.SaveChangesAsync();

                // Criar Perfil Formando
                var novoFormando = new Formando
                {
                    IdUtilizador = novoUtilizador.IdUtilizador,
                    IdEscolaridade = dto.IdEscolaridade // Novo campo da BD
                };

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

                // Inscrição em Turma
                if (dto.IdTurma.HasValue && dto.IdTurma > 0)
                {
                    _context.Inscricoes.Add(new Inscrico
                    {
                        IdFormando = novoFormando.IdFormando,
                        IdTurma = dto.IdTurma.Value,
                        DataInscricao = DateOnly.FromDateTime(DateTime.Now),
                        Estado = "Ativo"
                    });
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();
                return Ok(new { message = "Formando e Utilizador criados com sucesso!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = "Erro no registo: " + ex.Message });
            }
        }

        // PUT: api/Formandos/5
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFormando(int id, [FromForm] FormandoCompletoDTO dto)
        {
            var formando = await _context.Formandos
                .Include(f => f.IdUtilizadorNavigation)
                .FirstOrDefaultAsync(f => f.IdFormando == id);

            if (formando == null) return NotFound();

            // Validar NIF noutros utilizadores
            bool nifEmUso = await _context.Utilizadores.AnyAsync(u => u.Nif == dto.Nif && u.IdUtilizador != formando.IdUtilizador);
            if (nifEmUso) return Conflict(new { message = "O NIF já pertence a outro utilizador." });

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Atualizar Utilizador
                var u = formando.IdUtilizadorNavigation;
                u.Nome = dto.Nome;
                u.Nif = dto.Nif;
                u.Telefone = dto.Telefone;
                u.Morada = dto.Morada;
                u.DataNascimento = dto.DataNascimento;
                u.Sexo = dto.Sexo;

                // Atualizar Formando
                formando.IdEscolaridade = dto.IdEscolaridade;

                if (dto.Fotografia != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Fotografia.CopyToAsync(ms);
                    formando.Fotografia = ms.ToArray();
                }

                if (dto.Documento != null)
                {
                    using var ms = new MemoryStream();
                    await dto.Documento.CopyToAsync(ms);
                    formando.AnexoFicheiro = ms.ToArray();
                }

                // Gestão de Inscrição
                var inscricaoAtual = await _context.Inscricoes
                    .FirstOrDefaultAsync(i => i.IdFormando == id && i.Estado == "Ativo");

                if (dto.IdTurma.HasValue && dto.IdTurma > 0)
                {
                    if (inscricaoAtual == null)
                    {
                        _context.Inscricoes.Add(new Inscrico
                        {
                            IdFormando = id,
                            IdTurma = dto.IdTurma.Value,
                            DataInscricao = DateOnly.FromDateTime(DateTime.Now),
                            Estado = "Ativo"
                        });
                    }
                    else if (inscricaoAtual.IdTurma != dto.IdTurma.Value)
                    {
                        inscricaoAtual.IdTurma = dto.IdTurma.Value;
                    }
                }
                else if (inscricaoAtual != null)
                {
                    inscricaoAtual.Estado = "Suspenso";
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Dados atualizados com sucesso!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = "Erro: " + ex.Message });
            }
        }

        // DELETE: api/Formandos/5
        // Nota: Devido às FKs, remover um formando sem remover o utilizador 
        // ou usar Cascade Delete. Aqui removemos o perfil e mantemos o utilizador (Soft Delete mental)
        // Ou removemos ambos.
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFormando(int id)
        {
            var formando = await _context.Formandos.FindAsync(id);
            if (formando == null) return NotFound();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Remover inscrições primeiro (se não houver cascade no SQL)
                var inscricoes = _context.Inscricoes.Where(i => i.IdFormando == id);
                _context.Inscricoes.RemoveRange(inscricoes);

                _context.Formandos.Remove(formando);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return NoContent();
            }
            catch
            {
                await transaction.RollbackAsync();
                return BadRequest("Não é possível remover o formando pois existem dados vinculados (notas, etc).");
            }
        }
    }
}