namespace ProjetoAdministracaoEscola.ModelsDTO.Avaliacao
{
    public class AvaliacaoAlunoDTO
    {
        public int IdInscricao { get; set; }
        public int IdFormando { get; set; }
        public string NomeFormando { get; set; }
        public decimal? Nota { get; set; }
    }
}
