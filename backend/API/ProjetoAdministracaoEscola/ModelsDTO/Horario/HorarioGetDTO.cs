namespace ProjetoAdministracaoEscola.ModelsDTO.Horario
{
    public class HorarioGetDTO
    {
        public int IdHorario { get; set; }

        public string NomeTurma { get; set; } = null!;

        public string NomeCurso { get; set; } = null!;

        public string NomeModulo { get; set; } = null!;

        public string NomeFormador { get; set; } = null!;

        public string NomeSala { get; set; } = null!;

        public DateOnly Data { get; set; }

        public string HoraInicio { get; set; }

        public string HoraFim { get; set; }
    }
}
