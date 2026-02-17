using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Http.HttpResults;
using MimeKit;
using MimeKit.Text;

namespace ProjetoAdministracaoEscola.Services
{
    public class EmailService
    {

        private readonly IConfiguration _configuration;

        public EmailService (IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<bool> SendActivationEmail(string toEmail, string UserName, string token)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_configuration["EMAIL_USER"]));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = "Ativação de Conta - Hawk Portal";

            string activationLink = $"https://localhost:7022/api/auth/confirm?token={token}";

            email.Body = new TextPart(TextFormat.Html)
            {
                Text = $@"
                <h2>Bem-vindo ao Hawk Portal, {UserName}!</h2>
                <p>Obrigado por se registar na nossa plataforma. Para ativar a sua conta, por favor clique no link abaixo:</p>
                <a href='{activationLink}' style='padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;'>Ativar Minha Conta</a>
                <p>Se não se registou nesta plataforma, por favor ignore este email.</p>
                <br/>
                <p>Atenciosamente,<br/>Equipe Hawk Portal</p>"
            };

            try
            {
                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(_configuration["EMAIL_HOST"], int.Parse(_configuration["EMAIL_PORT"]), SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_configuration["EMAIL_USER"], _configuration["EMAIL_PASSWORD"]);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao enviar email: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlContent)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_configuration["EMAIL_USER"]));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            email.Body = new TextPart(TextFormat.Html)
            {
                Text = htmlContent
            };

            try
            {
                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(_configuration["EMAIL_HOST"], int.Parse(_configuration["EMAIL_PORT"]), SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_configuration["EMAIL_USER"], _configuration["EMAIL_PASSWORD"]);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao enviar email: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> SendResetEmail(string toEmail, string link)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_configuration["EMAIL_USER"]));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = "Recuperar password";

            email.Body = new TextPart(TextFormat.Html)
            {
                Text = $@"
                <h2>Hawk Portal, </h2>
                <p>Caso se tenha esquecido da sua password por favor clink no link em baixo:</p>
                <a href='{link}' style='padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;'>Recuperar password</a>
                <p>Se não pediu para recuperar a password, por favor ignore este email.</p>
                <br/>
                <p>Atenciosamente,<br/>Equipe Hawk Portal</p>"
            };

            try
            {
                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(_configuration["EMAIL_HOST"], int.Parse(_configuration["EMAIL_PORT"]), SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_configuration["EMAIL_USER"], _configuration["EMAIL_PASSWORD"]);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao enviar email: {ex.Message}");
                return false;
            }
        }
    }
}
