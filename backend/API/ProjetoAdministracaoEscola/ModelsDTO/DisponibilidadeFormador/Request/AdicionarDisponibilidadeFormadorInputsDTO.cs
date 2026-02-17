namespace ProjetoAdministracaoEscola.ModelsDTO.DisponibilidadeFormador.Request
{
    public class AdicionarDisponibilidadeFormadorInputsDTO
    {
        public string DataInicio { get; set; } = null!;
        public string DataFim { get; set; } = null!;
        public string HoraInicio { get; set; } = null!;
        public string HoraFim { get; set; } = null!;
    }
}
