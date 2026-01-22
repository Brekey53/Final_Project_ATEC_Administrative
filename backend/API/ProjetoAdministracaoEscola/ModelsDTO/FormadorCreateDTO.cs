namespace ProjetoAdministracaoEscola.ModelsDTO
{
    public class FormadorCreateDTO
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string Nome { get; set; }
        public string Nif { get; set; }
        public string Telefone { get; set; }
        public DateOnly DataNascimento { get; set; }
        public string Sexo { get; set; }
        public string Morada { get; set; }

        // IFormFile permite receber os ficheiros do FormData
        public IFormFile? Fotografia { get; set; }
        public IFormFile? Documento { get; set; }
    }
}
