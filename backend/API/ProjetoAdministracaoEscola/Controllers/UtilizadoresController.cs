using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Users.Requests;
using ProjetoAdministracaoEscola.ModelsDTO.Users.Responses;
using System.Security.Claims;

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

        /// <summary>
        /// Obtém a lista de todos os utilizadores registados no sistema.
        /// </summary>
        /// <remarks>
        /// Para cada utilizador são devolvidos:
        /// - Dados pessoais básicos
        /// - Tipo de utilizador (Admin, Formador, Formando, Administrativo, Geral)
        /// - Estado de ativação
        /// 
        /// A lista é devolvida ordenada alfabeticamente pelo nome.
        /// </remarks>
        /// <returns>
        /// Lista de <see cref="UtilizadorDTO"/>.
        /// </returns>
        /// <response code="200">Lista devolvida com sucesso.</response>
        [Authorize(Policy = "AdminOrAdministrativo")]
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

        /// <summary>
        /// Obtém os dados de um utilizador específico através do seu identificador.
        /// </summary>
        /// <param name="id">Identificador do utilizador.</param>
        /// <returns>
        /// Entidade <see cref="UtilizadorEditDTO"/> correspondente.
        /// </returns>
        /// <response code="200">Utilizador encontrado.</response>
        /// <response code="404">Utilizador não encontrado.</response>
        [Authorize(Policy = "AdminOrAdministrativo")]
        [HttpGet("{id}")]
        public async Task<ActionResult<UtilizadorEditDTO>> GetUtilizador(int id)
        {
            var dto = await _context.Utilizadores
                .AsNoTracking()
                .Where(u => u.IdUtilizador == id)
                .Select(u => new UtilizadorEditDTO
                {
                    IdUtilizador = u.IdUtilizador,
                    Email = u.Email,
                    Nome = u.Nome,
                    NIF = u.Nif,
                    Sexo = u.Sexo,
                    DataNascimento = u.DataNascimento,
                    Telefone = u.Telefone,
                    IdTipoUtilizador = u.IdTipoUtilizadorNavigation.IdTipoUtilizador,
                    TipoUtilizador = u.IdTipoUtilizadorNavigation.TipoUtilizador,
                    Ativo = u.Ativo,
                    Morada = u.Morada
                })
                .FirstOrDefaultAsync();

            if (dto == null)
                return NotFound();

            return Ok(dto);
        }


        /// <summary>
        /// Obtém o perfil completo do utilizador autenticado.
        /// </summary>
        /// <remarks>
        /// Inclui:
        /// - Dados base do utilizador
        /// - Informação adicional consoante o tipo:
        ///     • Formando: IdFormando e Escolaridade
        ///     • Formador: IdFormador, IBAN e Qualificações
        /// 
        /// O formato da resposta varia consoante o tipo de utilizador.
        /// </remarks>
        /// <returns>
        /// Objeto com informação de perfil.
        /// </returns>
        /// <response code="200">Perfil devolvido com sucesso.</response>
        /// <response code="401">Utilizador não autenticado.</response>
        /// <response code="404">Utilizador não encontrado.</response>
        ///api/utilizadores/perfil
        [Authorize]
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

            // Adicionar dados especificos se for Formando (Tipo 3) ou Formador (Tipo 2)
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

        /// <summary>
        /// Obtém a fotografia de perfil do utilizador autenticado.
        /// </summary>
        /// <remarks>
        /// A fotografia pode estar associada à entidade Formando ou Formador.
        /// Se não existir fotografia, é devolvido código 204 (NoContent).
        /// </remarks>
        /// <returns>
        /// Ficheiro binário no formato image/jpeg.
        /// </returns>
        /// <response code="200">Fotografia devolvida com sucesso.</response>
        /// <response code="204">Utilizador sem fotografia associada.</response>
        /// <response code="401">Utilizador não autenticado.</response>
        [Authorize]
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

        /// <summary>
        /// Atualiza os dados de um utilizador existente.
        /// </summary>
        /// <param name="id">Identificador do utilizador.</param>
        /// <param name="dto">Objeto com os novos dados.</param>
        /// <remarks>
        /// Regras aplicadas:
        /// - Apenas administradores podem atribuir perfil de Administrador.
        /// - Se o estado "Ativo" for alterado, é sincronizado com Formador/Formando.
        /// - Se o tipo de utilizador for alterado:
        ///     • Desativa perfis anteriores
        ///     • Ativa ou cria perfil correspondente ao novo tipo
        /// 
        /// Consome multipart/form-data.
        /// </remarks>
        /// <returns>
        /// Resultado da operação.
        /// </returns>
        /// <response code="204">Atualização realizada com sucesso.</response>
        /// <response code="403">Sem permissões suficientes.</response>
        /// <response code="404">Utilizador não encontrado.</response>
        // PUT: api/Utilizadores/5
        [Authorize(Policy = "AdminOrAdministrativo")]
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
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(f => f.IdUtilizadorNavigation.IdUtilizador == id);
                if (formando != null)
                    formando.Ativo = dto.Ativo;

                // // Atualizar na tabela Formador
                var formador = await _context.Formadores
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(f => f.IdUtilizadorNavigation.IdUtilizador == id);
                if (formador != null)
                    formador.Ativo = dto.Ativo;
            }

            // Se mudou o TIPO DE UTILIZADOR
            if (tipoAntigo != dto.IdTipoUtilizador)
            {
                // Desativar em ambas
                var formando = await _context.Formandos
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(f => f.IdUtilizadorNavigation.IdUtilizador == id);
                if (formando != null)
                    formando.Ativo = false;

                var formador = await _context.Formadores
                    .IgnoreQueryFilters()
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

        /// <summary>
        /// Cria um novo utilizador através de criação administrativa.
        /// </summary>
        /// <param name="dto">Dados do utilizador a criar.</param>
        /// <remarks>
        /// Valida:
        /// - Email único
        /// - NIF único
        /// 
        /// A password é armazenada com hash BCrypt.
        /// O utilizador é criado com estado de ativação ativo.
        /// </remarks>
        /// <returns>
        /// Identificação do novo utilizador.
        /// </returns>
        /// <response code="201">Utilizador criado com sucesso.</response>
        /// <response code="409">Email ou NIF já registado.</response>
        // POST: api/Utilizadores/new-user
        [Authorize(Policy = "AdminOrAdministrativo")]
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


        /// <summary>
        /// Regista um novo utilizador através de auto-registo público.
        /// </summary>
        /// <param name="dto">Dados de registo.</param>
        /// <remarks>
        /// Regras:
        /// - Email e NIF devem ser únicos.
        /// - O utilizador é criado com tipo "Geral".
        /// - A conta é criada com ativação pendente.
        /// - A password é armazenada com hash BCrypt.
        /// </remarks>
        /// <returns>
        /// Resultado do registo.
        /// </returns>
        /// <response code="200">Utilizador registado com sucesso.</response>
        /// <response code="409">Email ou NIF já existente.</response>
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

        /// <summary>
        /// Desativa (soft delete) um utilizador do sistema.
        /// </summary>
        /// <param name="id">Id do utilizador a desativar.</param>
        /// <remarks>
        /// Regras aplicadas:
        /// - O utilizador autenticado não pode eliminar a própria conta.
        /// - Apenas utilizadores com política "AdminOrAdministrativo" podem executar esta operação.
        /// 
        /// Caso o utilizador seja:
        ///Formador:
        ///     - Não pode ter aulas futuras agendadas.
        ///     - Caso não existam impedimentos, o perfil de formador é desativado.
        /// 
        ///Formando:
        ///     - Não pode estar inscrito em turmas com aulas futuras agendadas.
        ///     - Caso não existam impedimentos, o perfil de formando é desativado.
        /// 
        /// A operação é um soft delete:
        /// - A propriedade <c>Ativo</c> é definida como false.
        /// - A propriedade <c>DataDesativacao</c> é preenchida com a data atual.
        /// 
        /// Nenhum registo é fisicamente removido da base de dados.
        /// </remarks>
        /// <returns>
        /// Resultado da operação.
        /// </returns>
        /// <response code="204">Utilizador desativado com sucesso.</response>
        /// <response code="400">
        /// Violação de regra de negócio (ex: aulas futuras ou tentativa de autoeliminação).
        /// </response>
        /// <response code="404">Utilizador não encontrado.</response>
        /// <response code="403">Acesso negado.</response>
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

        /// <summary>
        /// Verifica se um email já se encontra registado no sistema.
        /// </summary>
        /// <param name="email">Endereço de email a validar.</param>
        /// <returns>
        /// Objeto com booleano.
        /// </returns>
        /// <response code="200">Resultado devolvido com sucesso.</response>
        [HttpGet("check-email")]
        public async Task<IActionResult> CheckEmail([FromQuery] string email)
        {
            var emailNormalizado = email.Trim().ToLower();

            var existe = await _context.Utilizadores
                .AnyAsync(u => u.Email.ToLower() == emailNormalizado);

            return Ok(new { existe });
        }

        /// <summary>
        /// Obtém os dados de um utilizador através do email.
        /// </summary>
        /// <param name="email">Email do utilizador.</param>
        /// <remarks>
        /// Se o utilizador não existir, é devolvido objeto com propriedade "Existe" a false.
        /// </remarks>
        /// <returns>
        /// Dados básicos do utilizador.
        /// </returns>
        /// <response code="200">Resultado devolvido com sucesso.</response>
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

        /// <summary>
        /// Obtém o nome de um utilizador através do email.
        /// </summary>
        /// <param name="email">Email do utilizador.</param>
        /// <returns>
        /// Objeto com email e nome.
        /// </returns>
        /// <response code="200">Resultado devolvido com sucesso.</response>
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
    }
}
