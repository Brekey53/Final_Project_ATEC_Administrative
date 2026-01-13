using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Facebook;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Http;
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

        [HttpPost("register")]
        public async Task<IActionResult> Register(UtilizadorRegisterDTO userdto)
        {
            string token = Guid.NewGuid().ToString(); // gerar token único

            if (await _context.Utilizadores.AnyAsync(u => u.Email == userdto.Email))
            {
                return BadRequest(new { message = "Email já está em uso." });
            }

            var newUser = new Utilizador
            {
                Email = userdto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userdto.Password),
                IdTipoUtilizador = 5,
                StatusAtivacao = false,
                TokenAtivacao = token
            };

            try
            {
                _context.Utilizadores.Add(newUser);
                await _context.SaveChangesAsync();

                // Enviar email de ativação
                bool emailEnviado = await _emailService.SendActivationEmail(newUser.Email, userdto.UserName, token);

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
            var utilizador = _context.Utilizadores.FirstOrDefault(u => u.Email == tfaDTO.Email);

            if (utilizador == null)
            {
                return Unauthorized(new { message = "Utilizador não encontrado." });
            }

            if (tfaDTO == null)
                return BadRequest("Body inválido");

            if (string.IsNullOrWhiteSpace(tfaDTO.Email) ||
                string.IsNullOrWhiteSpace(tfaDTO.Code))
            {
                return BadRequest("Email ou código em falta");
            }

            // Tenta recuperar o código da cache usando o email
            if (_cache.TryGetValue($"2FA_{tfaDTO.Email}", out string saveCode))
            {
                if (saveCode == tfaDTO.Code)
                {
                    _cache.Remove($"2FA_{tfaDTO.Email}");

                    // Gerar JWT token para local storage
                    var token = _tokenService.GerarJwtToken(
                        utilizador.Email,
                        utilizador.IdTipoUtilizador
                    );

                    return Ok(new
                    {
                        token = token,
                        tipoUtilizador = utilizador.IdTipoUtilizador,
                        message = "Login concluído com sucesso!"
                    });
                }
            }
            return Unauthorized(new { message = "Código 2FA inválido ou expirado." });  
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

        [HttpGet("callback-google")]
        public async Task<IActionResult> GoogleCallback()
        {
            var result = await HttpContext.AuthenticateAsync("ExternalCookieScheme");
            if (!result.Succeeded)
            {
                return BadRequest(new {message = "Falha na autenticação externa." });
            }

            // Extrair informações do usuário do resultado da autenticação
            var email = result.Principal.FindFirstValue(ClaimTypes.Email);

            var utilizador = await _context.Utilizadores.FirstOrDefaultAsync(u => u.Email == email);

            // Verificar se o utilizador existe na base de dados
            if (utilizador == null)
            {
                return Unauthorized(new { message = "Este email não tem autorização para aceder ao sistema, por favor contacte a administração." });
            }

            // Verificar se a conta está ativada
            if (utilizador.StatusAtivacao != true)
            {
                return BadRequest(new { message = "Necessita de ativar a conta via email antes do login." });
            }

            // Vincular ID do Google ao utilizador, se necessário
            if (string.IsNullOrEmpty(utilizador.IdGoogle))
            {
                utilizador.IdGoogle = result.Principal.FindFirstValue(ClaimTypes.NameIdentifier);
                await _context.SaveChangesAsync();
            }

            // Lógica para lidar com o callback do Google OAuth
            var token = _tokenService.GerarJwtToken(utilizador.Email, utilizador.IdTipoUtilizador);
            return Redirect($"http://localhost:5173/login?socialLoginG=success&token={token}");
        }

        [HttpGet("login-google")]
        public IActionResult LoginGoogle()
        {
            var propriedades = new AuthenticationProperties
            {
                RedirectUri = Url.Action("GoogleCallback")
            };

            return Challenge(propriedades, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("callback-facebook")]
        public async Task<IActionResult> FacebookCallback()
        {
            var result = await HttpContext.AuthenticateAsync("ExternalCookieScheme");
            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Falha na autenticação externa." });
            }

            // Extrair informações do usuário do resultado da autenticação
            var email = result.Principal.FindFirstValue(ClaimTypes.Email);

            var utilizador = await _context.Utilizadores.FirstOrDefaultAsync(u => u.Email == email);

            // Verificar se o utilizador existe na base de dados
            if (utilizador == null)
            {
                return Unauthorized(new { message = "Este email não tem autorização para aceder ao sistema, por favor contacte a administração." });
            }

            // Verificar se a conta está ativada
            if (utilizador.StatusAtivacao != true)
            {
                return BadRequest(new { message = "Necessita de ativar a conta via email antes do login." });
            }

            // Vincular ID do Facebook ao utilizador, se necessário
            if (string.IsNullOrEmpty(utilizador.IdFacebook))
            {
                utilizador.IdFacebook = result.Principal.FindFirstValue(ClaimTypes.NameIdentifier);
                await _context.SaveChangesAsync();
            }

            // Lógica para lidar com o callback do Facebook OAuth
            var token = _tokenService.GerarJwtToken(utilizador.Email, utilizador.IdTipoUtilizador);
            return Redirect($"http://localhost:5173/login?socialLoginF=success&token={token}");
        }

        [HttpGet("login-facebook")]
        public IActionResult LoginFacebook()
        {
            var propriedades = new AuthenticationProperties
            {
                RedirectUri = Url.Action("FacebookCallback")
            };

            return Challenge(propriedades, FacebookDefaults.AuthenticationScheme);
        }


    }
}
