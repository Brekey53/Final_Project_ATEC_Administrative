namespace ProjetoAdministracaoEscola.ModelsDTO.Horario.Requests
{
    public class DisponibilidadeFormadorMarcarHorarios
    {
        public DateTime Data { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFim { get; set; }
    }
}
