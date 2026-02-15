namespace ProjetoAdministracaoEscola.ModelsDTO.Horario
{
    public class ResumoAgendamentoModulo
    {
        public string NomeModulo { get; set; }
        public string NomeFormador { get; set; }
        public int HorasTotais { get; set; }
        public int HorasAgendadas { get; set; }
        public bool ConcluidoComSucesso { get; set; }
        public string DescricaoDetalhada { get; set; }
    }
}
