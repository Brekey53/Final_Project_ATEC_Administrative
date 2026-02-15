namespace ProjetoAdministracaoEscola.ModelsDTO.Avaliacao
{
    public class DarAvaliacaoDTO
    {
        public int IdInscricao { get; set; }
        public int IdModulo { get; set; }
        public decimal Nota { get; set; }
        public DateTime DataAvaliacao { get; set; }
    }
}
