using Humanizer;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.Models.ModelsDTO;
using ProjetoAdministracaoEscola.ModelsDTO;
using ProjetoAdministracaoEscola.Services;
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

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

        
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UtilizadorLoginDTO loginDto)
        {
            var utilizador = await _context.Utilizadores.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (utilizador == null)
            {
                return Unauthorized(new { message = "Credenciais inválidas." });
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

            Random rnd = new Random();

            string codigo2FA = rnd.Next(000000, 999999).ToString("D6"); // gerar codigo 2FA

            _cache.Set($"2FA_{utilizador.Email}", codigo2FA, TimeSpan.FromMinutes(5));
            //_cache.Set($"2FA_{utilizador.Email}", "000000", TimeSpan.FromMinutes(5));

            await _emailService.SendEmailAsync(utilizador.Email, "Código de Verificação", $"O seu código é:<h2><b> {codigo2FA}</b></h2>");

            return Ok(new
            {
                requires2FA = true,
                message = "Código enviado para o e-mail.",
                email = utilizador.Email
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UtilizadorRegisterDTO dto)
        {
            string token = Guid.NewGuid().ToString(); // gerar token único

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
                return StatusCode(500, new { message = "Erro ao salvar utilizador.", error = ex.Message });
            }
            

        }

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

        [HttpPost("verify-2fa")]
        public IActionResult Verify2FA([FromBody] Verify2FADTO tfaDTO)
        {
            if (tfaDTO == null)
                return BadRequest("Corpo inválido");

            if (string.IsNullOrWhiteSpace(tfaDTO.Email) ||
                string.IsNullOrWhiteSpace(tfaDTO.Code))
            {
                return BadRequest("Email ou código em falta");
            }

            if (!_cache.TryGetValue($"2FA_{tfaDTO.Email}", out string savedCode))
            {
                return BadRequest(new { message = "Código 2FA expirado." });
            }

            if (savedCode != tfaDTO.Code)
            {
                return BadRequest(new { message = "Código 2FA inválido." });
            }

            _cache.Remove($"2FA_{tfaDTO.Email}");

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

            return Ok(new
            {
                token,
                message = "Login concluído com sucesso!"
            });
        }

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
                if (utilizador == null) return BadRequest(new { message = "Utilizador inválido." });

                utilizador.PasswordHash = BCrypt.Net.BCrypt.HashPassword(resetDto.NewPassword);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Password alterada com sucesso!" });
            }
            catch (Exception)
            {
                return BadRequest(new { message = "Link inválido ou expirado." });
            }
        }

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

        [HttpPost("facebook")]
        public async Task<IActionResult> FacebookLogin([FromBody] FacebookLoginDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.IdToken))
                return BadRequest("Token inválido");

            using var httpClient = new HttpClient();

            var response = await httpClient.GetAsync(
                $"https://graph.facebook.com/me?fields=id,email&access_token={dto.IdToken}"
            );

            if (!response.IsSuccessStatusCode)
                return Unauthorized("Token Facebook inválido");

            var json = await response.Content.ReadAsStringAsync();
            var fbUser = JsonSerializer.Deserialize<FacebookUserDTO>(json);

            if (fbUser?.Email == null)
                return Unauthorized("Email não disponível no Facebook");

            var utilizador = await _context.Utilizadores
                .FirstOrDefaultAsync(u => u.Email == fbUser.Email);

            if (utilizador == null)
                return Unauthorized("Utilizador não autorizado");

            if (utilizador.StatusAtivacao != true)
                return Unauthorized("Conta não ativa");

            if (string.IsNullOrEmpty(utilizador.IdFacebook))
            {
                utilizador.IdFacebook = fbUser.Id;
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
