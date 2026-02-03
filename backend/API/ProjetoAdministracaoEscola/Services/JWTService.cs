using Microsoft.IdentityModel.Tokens;
using ProjetoAdministracaoEscola.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ProjetoAdministracaoEscola.Services
{
    public class JWTService
    {
        public string GerarJwtToken(int idUtilizador, string email, int idTipoUtilizador)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET");

            var key = Encoding.ASCII.GetBytes(secretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, idUtilizador.ToString()),
                    new Claim(ClaimTypes.Email, email),
                    new Claim("tipoUtilizador", idTipoUtilizador.ToString()),
                    new Claim("projeto", "HawkTuah")
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
