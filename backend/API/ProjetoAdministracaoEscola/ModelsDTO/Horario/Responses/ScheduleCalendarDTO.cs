namespace ProjetoAdministracaoEscola.ModelsDTO.Horario.Responses
{
    public class ScheduleCalendarDTO
    {
        public int IdHorario { get; set; }
        public DateOnly Data { get; set; }
        public TimeOnly HoraInicio { get; set; }
        public TimeOnly HoraFim { get; set; }

        public string NomeTurma { get; set; } = string.Empty;
        public string NomeSala { get; set; } = string.Empty;
        public string NomeModulo { get; set; } = string.Empty;
    }
}
