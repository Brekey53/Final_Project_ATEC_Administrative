namespace ProjetoAdministracaoEscola.ModelsDTO.Users
{
    public class UtilizadorDTO
    {
        public int IdUtilizador { get; set; }
        public string? Email { get; set; }

        public string? Nome { get; set; }
        public string? Telefone { get; set; }

        public string? TipoUtilizador { get; set; } 

        public string? Nif { get; set; }

        public bool Ativo { get; set; }
    }

}
