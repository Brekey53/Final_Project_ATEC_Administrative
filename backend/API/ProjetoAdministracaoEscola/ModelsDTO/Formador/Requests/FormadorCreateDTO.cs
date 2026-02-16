namespace ProjetoAdministracaoEscola.ModelsDTO.Formador.Requests
{
    public class FormadorCreateDTO
    {
        // Campos Utilizador
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string Nome { get; set; }
        public string Nif { get; set; }
        public DateOnly DataNascimento { get; set; }
        public string Morada { get; set; }
        public string? Telefone { get; set; }
        public string Sexo { get; set; }

        // Campos Formador
        public string? Iban { get; set; }
        public string? Qualificacoes { get; set; }

        // IFormFile permite receber os ficheiros do FormData
        public IFormFile? Fotografia { get; set; }
        public IFormFile? Documento { get; set; }

        public List<int> TiposMateria { get; set; } = new();
    }
}
