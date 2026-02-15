namespace ProjetoAdministracaoEscola.ModelsDTO.Users
{
    public class UtilizadorEditDTO
    {
        public int IdUtilizador { get; set; }

        public string Email { get; set; } = string.Empty;

        public string NomeCompleto { get; set; } = string.Empty;

        public string NIF { get; set; } = string.Empty;

        public string Sexo { get; set; } = string.Empty;

        public DateOnly DataNascimento { get; set; }

        public string Telefone { get; set; } = string.Empty;

        public string TipoUtilizador { get; set; } = string.Empty;

        public bool? Ativo { get; set; }

        public string Morada { get; set; } = string.Empty;
    }
}
