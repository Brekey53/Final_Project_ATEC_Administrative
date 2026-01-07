using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Horario
{
    public int IdHorario { get; set; }

    public int IdTurma { get; set; }

    public int IdModulo { get; set; }

    public int IdFormador { get; set; }

    public int IdSala { get; set; }

    public DateOnly Data { get; set; }

    public TimeOnly HoraInicio { get; set; }

    public TimeOnly HoraFim { get; set; }

    public virtual Formadore IdFormadorNavigation { get; set; } = null!;

    public virtual Modulo IdModuloNavigation { get; set; } = null!;

    public virtual Sala IdSalaNavigation { get; set; } = null!;

    public virtual Turma IdTurmaNavigation { get; set; } = null!;
}
