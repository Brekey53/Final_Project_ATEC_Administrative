using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Facebook;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using ProjetoAdministracaoEscola.Models;
using ProjetoAdministracaoEscola.Models.ModelsDTO;
using ProjetoAdministracaoEscola.Services;
using System.Security.Claims;
using ProjetoAdministracaoEscola.Services;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly SistemaGestaoContext _context;
        private readonly EmailService _emailService;
        private readonly JWTService _tokenService;

        public AuthController(SistemaGestaoContext context, EmailService emailService, 
            JWTService tokenService)
        {
            _context = context;
            _emailService = emailService;
            _tokenService = tokenService;
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
                return BadRequest("Necessita de ativar a conta via email antes do login.");
            }

            // Verificar a senha (implemente a lógica de verificação de senha conforme necessário)
            bool isValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, utilizador.PasswordHash);

            if (!isValid)
            {
                return Unauthorized(new { message = "Credenciais inválidas." });
            }

            var _token = _tokenService.GerarJwtToken(utilizador.Email);

            // Aqui você pode gerar um token JWT ou outra forma de autenticação
            return Ok(new
            {
                message = "Login bem-sucedido.",
                token = _token,
                tipoUtilizador = utilizador.IdTipoUtilizador 
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
            // return Ok(new { message = "Callback do Google recebido." /* token = "Token Aqui :D" */ });

            return Redirect("http://localhost:5173/Dashboard");
            // EXEMPLO: Redirect("http://localhost:front_port/login-success?token=" + token);
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

            // Vincular ID do Google ao utilizador, se necessário
            if (string.IsNullOrEmpty(utilizador.IdFacebook))
            {
                utilizador.IdFacebook = result.Principal.FindFirstValue(ClaimTypes.NameIdentifier);
                await _context.SaveChangesAsync();
            }

            // Lógica para lidar com o callback do Google OAuth
            //return Ok(new { message = "Callback do Facebook recebido." /* token = "Token Aqui :D" */ });
            return Redirect("http://localhost:5173/Dashboard");
            // EXEMPLO Redirect("http://localhost:front_port/login-success?token=" + token);
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
