using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Turma
{
    public int IdTurma { get; set; }
    public int IdCurso { get; set; }
    public string NomeTurma { get; set; } = null!;
    public DateOnly DataInicio { get; set; }
    public DateOnly DataFim { get; set; }

    public bool Ativo { get; set; }
    public DateTime? DataDesativacao { get; set; }

    public virtual Curso IdCursoNavigation { get; set; } = null!;
    public virtual ICollection<Horario> Horarios { get; set; } = new List<Horario>();
    public virtual ICollection<Inscrico> Inscricos { get; set; } = new List<Inscrico>();
    public virtual ICollection<TurmaAlocaco> TurmaAlocacos { get; set; } = new List<TurmaAlocaco>();
}
