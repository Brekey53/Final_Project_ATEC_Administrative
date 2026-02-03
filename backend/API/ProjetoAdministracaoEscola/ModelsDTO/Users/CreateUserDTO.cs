namespace ProjetoAdministracaoEscola.ModelsDTO.Users
{
    public class CreateUserDTO
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Nome { get; set; } = null!;
        public string Nif { get; set; } = null!;
        public string Telefone { get; set; } = null!;
        public DateOnly DataNascimento { get; set; }
        public string Sexo { get; set; } = null!;
        public string Morada { get; set; } = null!;
    }
}
