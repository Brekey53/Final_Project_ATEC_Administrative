namespace ProjetoAdministracaoEscola.ModelsDTO.Formador
{
    public class FormadorDTO
    {
        public int IdFormador { get; set; }
        public string Nome { get; set; } = "";
        public string Email { get; set; } = "";
        public string Nif { get; set; } = "";
        public string? Telefone { get; set; }
        public string? Qualificacoes { get; set; }
    }
}
