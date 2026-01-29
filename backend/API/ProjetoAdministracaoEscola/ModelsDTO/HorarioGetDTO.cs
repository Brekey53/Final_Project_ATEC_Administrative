namespace ProjetoAdministracaoEscola.ModelsDTO
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

        public TimeOnly HoraInicio { get; set; }

        public TimeOnly HoraFim { get; set; }
    }
}
