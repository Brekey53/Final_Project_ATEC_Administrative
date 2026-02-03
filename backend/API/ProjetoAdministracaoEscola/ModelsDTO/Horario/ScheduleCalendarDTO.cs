namespace ProjetoAdministracaoEscola.ModelsDTO.Horario
{
    public class ScheduleCalendarDTO
    {
        public int IdHorario { get; set; }
        public DateOnly Data { get; set; }
        public TimeOnly HoraInicio { get; set; }
        public TimeOnly HoraFim { get; set; }

        public string NomeCurso { get; set; } = string.Empty;
        public string NomeSala { get; set; } = string.Empty;
    }
}
