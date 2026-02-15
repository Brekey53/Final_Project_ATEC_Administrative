namespace ProjetoAdministracaoEscola.ModelsDTO.Horario.Responses
{
    public class HorarioMarcadoFormador
    {
        public DateOnly Data { get; set; }
        public string HoraInicio { get; set; }
        public string HoraFim { get; set; }

        public string NomeTurma { get; set; }
        public string NomeSala { get; set; }
    }
}
