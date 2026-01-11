using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Http.HttpResults;
using MimeKit;
using MimeKit.Text;

namespace ProjetoAdministracaoEscola.Services
{
    public class EmailService
    {
        public async Task<bool> SendActivationEmail(string toEmail, string UserName, string token)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse("sistema@hawkportal.pt"));
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
                await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync("croaemoita@gmail.com", "rhzm lvru aacx mucs");
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
