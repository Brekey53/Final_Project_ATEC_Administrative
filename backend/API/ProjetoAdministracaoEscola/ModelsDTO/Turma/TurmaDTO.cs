namespace ProjetoAdministracaoEscola.ModelsDTO.Turma
{
    public class TurmaDTO
    {
            public int IdTurma { get; set; }
            public string NomeTurma { get; set; }
            public DateOnly DataInicio { get; set; }
            public DateOnly DataFim { get; set; }
            public int IdCurso { get; set; }
            public string NomeCurso { get; set; }
            public string? Estado { get; set; } = string.Empty;
            public int IdMetodologia { get; set; }
            public string? NomeMetodologia { get; set; } = string.Empty;
    }
}
