namespace ProjetoAdministracaoEscola.ModelsDTO
{
    public class TurmaDecorrerDTO
    {
        public int IdTurma { get; set; }
        public string NomeTurma { get; set; } = string.Empty;
        public string NomeCurso { get; set; } = string.Empty;

        public DateOnly DataInicio { get; set; }
        public DateOnly DataFim { get; set; }
    }
}
