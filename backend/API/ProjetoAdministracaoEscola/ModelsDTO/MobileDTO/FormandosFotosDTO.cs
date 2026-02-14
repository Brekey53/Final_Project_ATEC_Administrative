namespace ProjetoAdministracaoEscola.ModelsDTO.MobileDTO
{
    public class FormandosFotosDTO
    {
        public int IdFormando{ get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public string? Escolaridade { get; set; }
        public string FotoUrl { get; set; } = string.Empty;
    }
}
