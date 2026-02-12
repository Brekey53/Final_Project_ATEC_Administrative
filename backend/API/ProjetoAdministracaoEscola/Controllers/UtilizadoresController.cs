using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Users;
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
            return await _context.Utilizadores
                .Include(u => u.IdTipoUtilizadorNavigation)
                .Select(u => new UtilizadorDTO
                {
                    IdUtilizador = u.IdUtilizador,
                    Nome = u.Nome,
                    Email = u.Email,
                    Telefone = u.Telefone,
                    Nif = u.Nif,
                    TipoUtilizador = u.IdTipoUtilizadorNavigation.TipoUtilizador, // Admin, Formador, Formando, Administrativo, Geral,
                    Ativo = u.Ativo
                })
                .OrderBy(u => u.Nome)
                .ToListAsync();
        }


        // GET: api/Utilizadores/5
        //TODO: Pode só ir buscar os UTILIZADOR DTO 
        //todo: METER POLICY ADMIN ADMINISTRATIVO ACIMA
        [HttpGet("{id}")]
        public async Task<ActionResult<Utilizador>> GetUtilizador(int id)
        {
            var utilizador = await _context.Utilizadores
                .FindAsync(id);

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
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            // Procuramos o utilizador e inclu?mos os perfis espec?ficos se existirem
            var user = await _context.Utilizadores
            .Include(u => u.Formadores)
            .Include(u => u.Formandos)
                .ThenInclude(f => f.IdEscolaridadeNavigation)
            .FirstOrDefaultAsync(u => u.IdUtilizador == userId);


            if (user == null) return NotFound("Utilizador n?o encontrado");

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

            // Adicionar dados espec?ficos se for Formando (Tipo 3) ou Formador (Tipo 2)
            if (user.IdTipoUtilizador == 3 && user.Formandos.Any())
            {
                var f = user.Formandos.First();
                return Ok(new
                {
                    baseInfo = perfilBase,
                    extra = new
                    {
                        f.IdFormando,
                        Escolaridade = f.IdEscolaridadeNavigation.Nivel
                    }
                });
            }

            if (user.IdTipoUtilizador == 2 && user.Formadores.Any())
            {
                var f = user.Formadores.First();
                return Ok(new
                {
                    baseInfo = perfilBase,
                    extra = new
                    {
                        f.IdFormador,
                        f.Iban,
                        f.Qualificacoes
                    }
                });
            }

            return Ok(perfilBase);
        }

        [HttpGet("perfil/foto")]
        public async Task<IActionResult> GetFotoPerfil()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            byte[]? foto =
                await _context.Formandos
                    .Where(f => f.IdUtilizador == userId)
                    .Select(f => f.Fotografia)
                    .FirstOrDefaultAsync()
                ??
                await _context.Formadores
                    .Where(f => f.IdUtilizador == userId)
                    .Select(f => f.Fotografia)
                    .FirstOrDefaultAsync();

            if (foto == null || foto.Length == 0)
                return NoContent();

            return File(foto, "image/jpeg");
        }


        // PUT: api/Utilizadores/5
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> PutUtilizador(int id, [FromForm] UtilizadorUpdateDTO dto) { 
  
            var utilizador = await _context.Utilizadores.FindAsync(id);
            if (utilizador == null)
                return NotFound();

            // Tipo do utilizador que envia pedido
            var tipoClaim = User.Claims
                .FirstOrDefault(c => c.Type == "tipoUtilizador")
                ?.Value;

            if (!int.TryParse(tipoClaim, out int tipoLogado))
                return Forbid("Token inválido.");

            // Proibir administrativos de mudar para admin
            if (dto.IdTipoUtilizador == 1 && tipoLogado != 1)
                return Forbid("Não tem permissões para atribuir perfil de Administrador.");

            // Guardar estado anterior
            var tipoAntigo = utilizador.IdTipoUtilizador;
            var ativoAntigo = utilizador.Ativo;

            // Atualizar utilizador
            utilizador.Nome = dto.Nome;
            utilizador.Nif = dto.Nif;
            utilizador.Telefone = dto.Telefone;
            utilizador.Morada = dto.Morada;
            utilizador.Sexo = dto.Sexo;
            utilizador.DataNascimento = dto.DataNascimento;
            utilizador.IdTipoUtilizador = dto.IdTipoUtilizador;
            utilizador.Ativo = dto.Ativo;

            // Se mudou o ATIVO
            if (ativoAntigo != dto.Ativo)
            {
                // Atualizar na tabela formandos
                var formando = await _context.Formandos
                    .FirstOrDefaultAsync(f => f.IdUtilizadorNavigation.IdUtilizador == id);
                if (formando != null)
                    formando.Ativo = dto.Ativo;

                // // Atualizar na tabela Formador
                var formador = await _context.Formadores
                    .FirstOrDefaultAsync(f => f.IdUtilizadorNavigation.IdUtilizador == id);
                if (formador != null)
                    formador.Ativo = dto.Ativo;
            }

            // Se mudou o TIPO DE UTILIZADOR
            if (tipoAntigo != dto.IdTipoUtilizador)
            {
                // Desativar em ambas
                var formando = await _context.Formandos
                    .FirstOrDefaultAsync(f => f.IdUtilizadorNavigation.IdUtilizador == id);
                if (formando != null)
                    formando.Ativo = false;

                var formador = await _context.Formadores
                    .FirstOrDefaultAsync(f => f.IdUtilizadorNavigation.IdUtilizador == id);
                if (formador != null)
                    formador.Ativo = false;

                // Ativar na tabela correspondente
                if (dto.IdTipoUtilizador == 3) // Formando
                {
                    if (formando != null)
                        formando.Ativo = true;
                    else
                        _context.Formandos.Add(new Formando
                        {
                            IdUtilizador = id,
                            Ativo = true
                        });
                }

                if (dto.IdTipoUtilizador == 2) // Formador
                {
                    if (formador != null)
                        formador.Ativo = true;
                    else
                        _context.Formadores.Add(new Formador
                        {
                            IdUtilizador = id,
                            Ativo = true
                        });
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }


        // POST: api/Utilizadores/new-user
        [HttpPost("new-user")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDTO dto)
        {
            // Verificar se email já existe
            if (await _context.Utilizadores.AnyAsync(u => u.Email == dto.Email))
                return Conflict(new { message = "Email já registado" });

            // Verificar se o NIF já se encontra na BD
            if (await _context.Utilizadores.AnyAsync(u => u.Nif == dto.Nif))
            {
                return Conflict(new { message = "NIF já em uso" });
            }

            // Criar utilizador
            var user = new Utilizador
            {
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Nome = dto.Nome,
                Nif = dto.Nif,
                Telefone = dto.Telefone,
                DataNascimento = dto.DataNascimento,
                Sexo = dto.Sexo,
                Morada = dto.Morada,
                StatusAtivacao = true
            };

            _context.Utilizadores.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUtilizador), new { id = user.IdUtilizador }, new
            {
                user.IdUtilizador,
                user.Email,
                user.Nome
            });
        }


        // ESTE É O DE CRIAR CONTA NOVA NORMAL
        // POST: api/Utilizadores
        [HttpPost]
        public async Task<ActionResult> PostUtilizador(UtilizadorRegisterDTO dto)
        {
            if (await _context.Utilizadores.AnyAsync(u => u.Email == dto.Email))
                return Conflict(new { message = "Email já registado" });
            
            if (await _context.Utilizadores.AnyAsync(u => u.Nif == dto.Nif))
            {
                return Conflict(new { message = "NIF já em uso" });
            }

            var newUser = new Utilizador
            {
                Nome = dto.Nome,
                Nif = dto.Nif,
                DataNascimento = dto.DataNascimento,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                IdTipoUtilizador = 5, // criar como geral
                Email = dto.Email,
                Morada = dto.Morada,
                Telefone = dto.Telefone,
                Sexo = dto.Sexo,
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
            // Impedir que o admin se apague a si pr?prio
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (currentUserId != null && currentUserId == id.ToString())
            {
                return BadRequest(new { message = "Não pode eliminar a sua própria conta." });
            }


            var utilizador = await _context.Utilizadores
                .Include(u => u.IdTipoUtilizadorNavigation)
                .FirstOrDefaultAsync(f => f.IdUtilizador == id);

            if (utilizador == null)
            {
                return NotFound(new { message = "Utilizador não encontrado." });
            }


            // Caso seja formador desativa
            var formador = await _context.Formadores
                .FirstOrDefaultAsync(f => f.IdUtilizadorNavigation.IdUtilizador == id);

            if (formador != null)
            {
                var aulasFuturasMarcadas = await _context.Horarios
                .AnyAsync(h => h.IdFormador == formador.IdFormador &&
                h.Data > DateOnly.FromDateTime(DateTime.Now));

                if (aulasFuturasMarcadas)
                {
                    return BadRequest(new { message = "Não é possível eliminar o formador pois ele tem aulas agendadas para o futuro." });
                }

                formador.Ativo = false;
                formador.DataDesativacao = DateTime.Now;
            }

            // Caso seja formando desativa
            var formando = await _context.Formandos
                .FirstOrDefaultAsync(f => f.IdUtilizadorNavigation.IdUtilizador == id);

            if (formando != null)
            {
                // Verificar se existe alguma inscrição associada
                bool temAulasFuturas = await _context.Inscricoes
                    .Where(i => i.IdFormando == id)
                    .AnyAsync(i => _context.Horarios.Any(h =>
                        h.IdTurma == i.IdTurma &&
                        h.Data > DateOnly.FromDateTime(DateTime.Now)
                    ));

                if (temAulasFuturas)
                {
                    return BadRequest(new { message = "Não é possível eliminar o formando pois ele está inscrito numa turma com aulas agendadas para o futuro." });
                }


                formando.Ativo = false;
                formando.DataDesativacao = DateTime.Now;
            }


            // Soft Delete
            utilizador.Ativo = false;
            utilizador.DataDesativacao = DateTime.Now;



            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("check-email")]
        public async Task<IActionResult> CheckEmail([FromQuery] string email)
        {
            var emailNormalizado = email.Trim().ToLower();

            var existe = await _context.Utilizadores
                .AnyAsync(u => u.Email.ToLower() == emailNormalizado);

            return Ok(new { existe });
        }


        [HttpGet("details-by-email")]
        public async Task<IActionResult> GetUserDetails(string email)
        {
            var user = await _context.Utilizadores
                .Select(u => new
                {
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

        [HttpGet("name-by-email")]
        public async Task<IActionResult> GetUserName(string email)
        {
            var user = await _context.Utilizadores
                .Select(u => new
                {
                    u.Email,
                    u.Nome,
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
