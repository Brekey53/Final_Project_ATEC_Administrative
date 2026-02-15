namespace ProjetoAdministracaoEscola.ModelsDTO.Horario.Requests
{
    public class HorarioSaveDTO
    {
        public int IdHorario { get; set; }
        public int IdTurma { get; set; }
        public int IdFormador { get; set; }
        public int IdSala { get; set; }
        public int IdCursoModulo { get; set; }

        public DateOnly Data { get; set; }
        public string HoraInicio { get; set; }
        public string HoraFim { get; set; }
    }
}
