using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class TurmaAlocaco
{
    public int IdAlocacao { get; set; }

    public int IdTurma { get; set; }

    public int IdModulo { get; set; }

    public int IdFormador { get; set; }

    public virtual Formadore IdFormadorNavigation { get; set; } = null!;

    public virtual Modulo IdModuloNavigation { get; set; } = null!;

    public virtual Turma IdTurmaNavigation { get; set; } = null!;
}
