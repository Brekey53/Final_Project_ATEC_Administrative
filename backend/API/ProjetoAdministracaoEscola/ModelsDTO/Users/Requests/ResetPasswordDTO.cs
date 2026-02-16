namespace ProjetoAdministracaoEscola.ModelsDTO.Users.Requests
{
    public class ResetPasswordDTO
    {
        public string Token { get; set; } = null!;

        public string NewPassword { get; set; } = null!;
    }
}
