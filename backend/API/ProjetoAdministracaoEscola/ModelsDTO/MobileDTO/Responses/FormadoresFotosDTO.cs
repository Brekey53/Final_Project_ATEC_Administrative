namespace ProjetoAdministracaoEscola.ModelsDTO.MobileDTO.Responses
{
    public class FormadoresFotosDTO
    {
        public int IdFormador { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public string? Qualificacoes { get; set; }
        public string FotoUrl { get; set; } = string.Empty;
    }
}
