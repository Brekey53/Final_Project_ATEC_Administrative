namespace ProjetoAdministracaoEscola.ModelsDTO
{
    public class TurmaFormadorDTO
    {
        public int IdTurma { get; set; }
        public int IdModulo { get; set; }
        public string NomeTurma { get; set; }
        public string NomeModulo { get; set; }
        public DateOnly DataInicio { get; set; }
        public DateOnly DataFim { get; set; }
        public int IdCurso { get; set; }

    }
}
