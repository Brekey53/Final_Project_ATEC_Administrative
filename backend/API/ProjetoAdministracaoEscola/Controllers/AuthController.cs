using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjetoAdministracaoEscola.Data;
using System.Security.Claims;

namespace ProjetoAdministracaoEscola.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly SistemaGestaoContext _context;

        public AuthController(SistemaGestaoContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Models.UtilizadorLoginDTO loginDto)
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
            //bool isValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, utilizador.PasswordHash);

            //if (!isValid)
            //{
            //    return Unauthorized(new { message = "Credenciais inválidas." });
            //}

            // Aqui você pode gerar um token JWT ou outra forma de autenticação
            return Ok(new { message = "Login bem-sucedido.", utilizadorId = utilizador.IdUtilizador });

        }

        [HttpGet("callback-google")]
        public async Task<IActionResult> GoogleCallback()
        {
            var result = await HttpContext.AuthenticateAsync("ExternalCookieScheme");
            if (!result.Succeeded)
            {
                return BadRequest("Falha na autenticação externa.");
            }

            // Extrair informações do usuário do resultado da autenticação
            var email = result.Principal.FindFirstValue(ClaimTypes.Email);

            var utilizador = await _context.Utilizadores.FirstOrDefaultAsync(u => u.Email == email);

            // Verificar se o utilizador existe na base de dados
            if (utilizador == null)
            {
                return Unauthorized("Este email não tem autorização para aceder ao sistema, por favor contacte a administração.");
            }

            // Verificar se a conta está ativada
            if (utilizador.StatusAtivacao != true)
            {
                return BadRequest("Necessita de ativar a conta via email antes do login.");
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

        [HttpGet("callback-facebook")]
        public async Task<IActionResult> FacebookCallback()
        {
            var result = await HttpContext.AuthenticateAsync("ExternalCookieScheme");
            if (!result.Succeeded)
            {
                return BadRequest("Falha na autenticação externa.");
            }

            // Extrair informações do usuário do resultado da autenticação
            var email = result.Principal.FindFirstValue(ClaimTypes.Email);

            var utilizador = await _context.Utilizadores.FirstOrDefaultAsync(u => u.Email == email);

            // Verificar se o utilizador existe na base de dados
            if (utilizador == null)
            {
                return Unauthorized("Este email não tem autorização para aceder ao sistema, por favor contacte a administração.");
            }

            // Verificar se a conta está ativada
            if (utilizador.StatusAtivacao != true)
            {
                return BadRequest("Necessita de ativar a conta via email antes do login.");
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

        [HttpGet("login-google")]
        public IActionResult LoginGoogle()
        {
            var propriedades = new AuthenticationProperties
            {
                RedirectUri = Url.Action("GoogleCallback")
            };

            return Challenge(propriedades, GoogleDefaults.AuthenticationScheme);
        }
    }
}
