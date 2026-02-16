namespace ProjetoAdministracaoEscola.ModelsDTO.Avaliacao.Responses
{
    public class AvaliacaoFormandoDTO
    {
        public int IdAvaliacao { get; set; }

        public string NomeModulo { get; set; } = string.Empty;

        public decimal? Nota { get; set; }

        public DateOnly? DataAvaliacao { get; set; }

        public int TotalModulosCurso { get; set; }
    }
}
