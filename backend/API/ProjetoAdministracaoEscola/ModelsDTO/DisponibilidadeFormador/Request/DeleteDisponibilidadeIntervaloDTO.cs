namespace ProjetoAdministracaoEscola.ModelsDTO.DisponibilidadeFormador.Request
{
    public class DeleteDisponibilidadeIntervaloDTO
    {
        public DateOnly DataInicio { get; set; }
        public DateOnly DataFim { get; set; }
        public TimeOnly HoraInicio { get; set; }
        public TimeOnly HoraFim { get; set; }
    }
}
