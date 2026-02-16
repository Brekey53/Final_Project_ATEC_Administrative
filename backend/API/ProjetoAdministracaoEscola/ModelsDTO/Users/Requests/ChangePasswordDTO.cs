namespace ProjetoAdministracaoEscola.ModelsDTO.Users.Requests
{
    public class ChangePasswordDTO
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

}
