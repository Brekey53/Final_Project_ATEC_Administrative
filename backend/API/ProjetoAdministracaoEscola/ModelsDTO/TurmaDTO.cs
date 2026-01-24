namespace ProjetoAdministracaoEscola.ModelsDTO
{
    public class TurmaDTO
    {
            public int IdTurma { get; set; }
            public string NomeTurma { get; set; }
            public DateOnly DataInicio { get; set; }
            public DateOnly DataFim { get; set; }
            public int IdCurso { get; set; }
        }
}
