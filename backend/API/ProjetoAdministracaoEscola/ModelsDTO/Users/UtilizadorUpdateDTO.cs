namespace ProjetoAdministracaoEscola.ModelsDTO.Users
{
    public class UtilizadorUpdateDTO
    {
        public string? Nome { get; set; }
        public string? Nif { get; set; }
        public DateOnly DataNascimento { get; set; }
        public string? Morada { get; set; }
        public string? Telefone { get; set; }

        public int IdTipoUtilizador { get; set; }
        public string? Sexo { get; set; }
        public string? Email { get; set; }
    }
}
