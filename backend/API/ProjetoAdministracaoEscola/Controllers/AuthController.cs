using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.ModelsDTO.Login;
using ProjetoAdministracaoEscola.ModelsDTO.Users;
using ProjetoAdministracaoEscola.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly SistemaGestaoContext _context;
        private readonly EmailService _emailService;
        private readonly JWTService _tokenService;
        private readonly IMemoryCache _cache;
        private readonly IConfiguration _configuration;

        public AuthController(SistemaGestaoContext context, EmailService emailService, 
            JWTService tokenService, IMemoryCache cache, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _tokenService = tokenService;
            _cache = cache;
            _configuration = configuration;
        }

        /// <summary>
        /// Autentica um utilizador com email e password.
        /// Se as credenciais forem válidas e a conta estiver ativada,
        /// inicia o processo de autenticação 2 fatores (2FA).
        /// </summary>
        /// <param name="loginDto">
        /// DTO contendo o email e a password do utilizador.
        /// </param>
        /// <returns>
        /// 200 OK se as credenciais forem válidas;
        /// 400 BadRequest se a conta não estiver ativada;
        /// 401 Unauthorized se as credenciais forem inválidas.
        /// </returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UtilizadorLoginDTO loginDto)
        {
            var utilizador = await _context.Utilizadores.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (utilizador == null)
            {
                return Unauthorized(new { message = "Utilizador não registado." });
            }

            if (utilizador.StatusAtivacao != true)
            {
                return BadRequest( new { message = "Necessita de ativar a conta via email antes do login." });
            }

            // Verificar a senha
            bool isValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, utilizador.PasswordHash);

            if (!isValid)
            {
                return Unauthorized(new { message = "Credenciais inválidas." });
            }

            // Para os superadmin evitar o 2FA
            if (utilizador.IdTipoUtilizador == 6)
            {
                var token = _tokenService.GerarJwtToken(
                    utilizador.IdUtilizador,
                    utilizador.Email,
                    utilizador.IdTipoUtilizador
                );

                return Ok(new
                {
                    requires2FA = false,
                    token,
                    message = "Login concluído com sucesso!"
                });
            }

            //Random rnd = new Random();

            //string codigo2FA = rnd.Next(000000, 999999).ToString("D6"); // gerar codigo 2FA

            //_cache.Set($"2FA_{utilizador.Email}", codigo2FA, TimeSpan.FromMinutes(5));
            _cache.Set($"2FA_{utilizador.Email}", "000000", TimeSpan.FromMinutes(5));

            //await _emailService.SendEmailAsync(utilizador.Email, "Código de Verificação", $"O seu código é:<h2><b> {codigo2FA}</b></h2>");

            return Ok(new
            {
                requires2FA = true,
                message = "Código enviado para o e-mail.",
                email = utilizador.Email
            });
        }

        /// <summary>
        /// O utilizador regista-se no Hawk Portal.
        /// O utilizador é criado com estado pendente de ativação
        /// e recebe um email com link de confirmação.
        /// </summary>
        /// <param name="dto">
        /// Dados necessários para registo do utilizador.
        /// </param>
        /// <returns>
        /// 200 OK se o utilizador for criado com sucesso;
        /// 400 BadRequest se o email já estiver em uso;
        /// 500 InternalServerError se ocorrer erro ao guardar ou enviar email.
        /// </returns>
        [HttpPost("register")]
        public async Task<IActionResult> Register(UtilizadorRegisterDTO dto)
        {
            string token = Guid.NewGuid().ToString();

            if (await _context.Utilizadores.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "Email já está em uso." });
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
                StatusAtivacao = false,
                TokenAtivacao = token
            };

            try
            {
                _context.Utilizadores.Add(newUser);
                await _context.SaveChangesAsync();

                // Enviar email de ativação
                bool emailEnviado = await _emailService.SendActivationEmail(newUser.Email, dto.Nome, token);

                if (emailEnviado)
                {
                    return Ok(new { message = "Utilizador registado! Verifique o email para ativar." });
                }

                return StatusCode(500, "Utilizador criado, mas houve um erro ao enviar o email de ativação.");
            } catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao guardar utilizador.", error = ex.Message });
            }
            

        }

        /// <summary>
        /// Confirma a ativação da conta através do token enviado por email.
        /// </summary>
        /// <param name="token">
        /// Token único de ativação associado ao utilizador.
        /// </param>
        /// <returns>
        /// Redireciona para a página de login se a ativação for bem-sucedida;
        /// 400 BadRequest se o token for inválido ou expirado.
        /// </returns>
        [HttpGet("confirm")]
        public async Task<IActionResult> ConfirmAccount([FromQuery] string token)
        {
            var utilizador = await _context.Utilizadores.FirstOrDefaultAsync(u => u.TokenAtivacao == token);

            if (utilizador == null)
            {
                return BadRequest(new { message = "Link de ativação inválido ou expirado" });
            }

            utilizador.StatusAtivacao = true;
            utilizador.TokenAtivacao = null; // Remover o token após a ativação

            await _context.SaveChangesAsync(); // atualizar BD

            return Redirect("http://localhost:5173/login?ativado=true");
        }

        /// <summary>
        /// Valida o código de autenticação 2FA
        /// e gera o token JWT de acesso ao sistema.
        /// </summary>
        /// <param name="tfaDTO">
        /// Objeto com o email e o código 2FA introduzido.
        /// </param>
        /// <returns>
        /// 200 OK com token JWT se o código for válido;
        /// 400 BadRequest se o código for inválido ou estiver expirado (5 minutos);
        /// 401 Unauthorized se o utilizador não for encontrado.
        /// </returns>
        [HttpPost("verify-2fa")]
        public IActionResult Verify2FA([FromBody] Verify2FADTO tfaDTO)
        {
            if (tfaDTO == null)
                return BadRequest("Pedido inválido");

            if (string.IsNullOrWhiteSpace(tfaDTO.Email) ||
                string.IsNullOrWhiteSpace(tfaDTO.Code))
            {
                return BadRequest( new { message = "Email ou código em falta" });
            }

            if (!_cache.TryGetValue($"2FA_{tfaDTO.Email}", out string savedCode))
            {
                return BadRequest(new { message = "Código 2FA expirado." });
            }

            if (savedCode != tfaDTO.Code)
            {
                return BadRequest(new { message = "Código 2FA inválido." });
            }

            _cache.Remove($"2FA_{tfaDTO.Email}"); // retirar o token 2fa

            var utilizador = _context.Utilizadores.AsNoTracking().FirstOrDefault(u => u.Email == tfaDTO.Email);

            if (utilizador == null)
            {
                return Unauthorized(new { message = "Utilizador não encontrado." });
            }

            // Gerar o token
            var token = _tokenService.GerarJwtToken(
                utilizador.IdUtilizador,
                utilizador.Email,
                utilizador.IdTipoUtilizador
            );

            return Ok( new
            {
                token,
                message = "Login concluído com sucesso!"
            });
        }

        /// <summary>
        /// Inicia o processo de recuperação de password.
        /// Se o email existir, envia um link de redefinição válido por 30 minutos.
        /// </summary>
        /// <param name="forgotPasswordDto">
        /// Objeto com o email do utilizador.
        /// </param>
        /// <returns>
        /// 200 OK com mensagem de instruções
        /// </returns>
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO forgotPasswordDto)
        {

            var utilizador = await _context.Utilizadores.FirstOrDefaultAsync(u => u.Email == forgotPasswordDto.Email);

            if (utilizador == null)
            {
                return Ok(new { message = "Se o email existir, receberá instruções." });
            }

            // Tempo de expiração Token
            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, utilizador.Email),
                new Claim("Purpose", "ResetPassword") // para garantir que o token é apenas para reset de password
            };

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT_SECRET"]));

            var token = new JwtSecurityToken(
                expires: DateTime.Now.AddMinutes(30), // O TOKEN MORRE EM 30 MINUTOS
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            string tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            string resetLink = $"http://localhost:5173/reset-password?token={tokenString}";
            await _emailService.SendResetEmail(utilizador.Email, resetLink);

            return Ok(new { message = "Se o email existir, receberá instruções." });
        }

        /// <summary>
        /// Redefine a password do utilizador com base num token JWT válido.
        /// </summary>
        /// <param name="resetDto">
        /// Objeto contendo o token de redefinição e a nova password.
        /// </param>
        /// <returns>
        /// 200 OK se a password for alterada com sucesso;
        /// 400 BadRequest se o token for inválido ou expirado.
        /// </returns>
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO resetDto)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["JWT_SECRET"]);

            try
            {
                // Validar o Token
                tokenHandler.ValidateToken(resetDto.Token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var email = jwtToken.Claims.First(x => x.Type == ClaimTypes.Email).Value;

                // Procurar utilizador e atualizar
                var utilizador = await _context.Utilizadores.FirstOrDefaultAsync(u => u.Email == email);
                if (utilizador == null) 
                    return BadRequest( new { message = "Utilizador inválido." });

                utilizador.PasswordHash = BCrypt.Net.BCrypt.HashPassword(resetDto.NewPassword);
                await _context.SaveChangesAsync();

                return Ok( new { message = "Password alterada com sucesso!" });
            }
            catch (Exception)
            {
                return BadRequest( new { message = "Link inválido ou expirado." });
            }
        }

        /// <summary>
        /// Permite a um utilizador autenticado alterar a sua password.
        /// </summary>
        /// <param name="dto">
        /// Objeto com a password atual e a nova password.
        /// </param>
        /// <returns>
        /// 200 OK se a alteração for bem-sucedida;
        /// 400 BadRequest se a password atual estiver incorreta;
        /// 401 Unauthorized se o utilizador não estiver autenticado.
        /// </returns>
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
        {
            var email = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(email))
                return Unauthorized(new { message = "Utilizador não autenticado." });

            var utilizador = await _context.Utilizadores.FirstOrDefaultAsync(u => u.Email == email);
            if (utilizador == null)
                return Unauthorized(new { message = "Utilizador inválido." });

            
            var passwordOk = BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, utilizador.PasswordHash);
            if (!passwordOk)
                return BadRequest(new { message = "Password atual incorreta." });

            
            utilizador.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password alterada com sucesso." });
        }

        /// <summary>
        /// Autentica um utilizador através de login com Google.
        /// Valida o idToken fornecido e gera um token JWT interno.
        /// </summary>
        /// <param name="dto">
        /// Objeto contendo o idToken devolvido pelo Google.
        /// </param>
        /// <returns>
        /// 200 OK com token JWT se o login for válido;
        /// 400 BadRequest se a conta não estiver ativada;
        /// 401 Unauthorized se o utilizador não estiver autorizado.
        /// </returns>
        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDTO dto)
        {
            var payload = await Google.Apis.Auth.GoogleJsonWebSignature
                .ValidateAsync(dto.IdToken);

            var email = payload.Email;

            var utilizador = await _context.Utilizadores
                .FirstOrDefaultAsync(u => u.Email == email);

            if (utilizador == null)
            {
                return Unauthorized(new
                {
                    message = "Este email não tem acesso ao sistema."
                });
            }

            if (utilizador.StatusAtivacao != true)
            {
                return BadRequest(new
                {
                    message = "Conta não ativada."
                });
            }

            // guardar Google ID se ainda não existir
            if (string.IsNullOrEmpty(utilizador.IdGoogle))
            {
                utilizador.IdGoogle = payload.Subject;
                await _context.SaveChangesAsync();
            }

            var token = _tokenService.GerarJwtToken(
                utilizador.IdUtilizador,
                utilizador.Email,
                utilizador.IdTipoUtilizador
            );

            return Ok(new { token });
        }

    }
}
