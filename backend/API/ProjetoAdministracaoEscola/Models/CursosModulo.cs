using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class CursosModulo
{
    public int IdCursoModulo { get; set; }

    public int IdCurso { get; set; }

    public int IdModulo { get; set; }

    public int Prioridade { get; set; }

    public virtual Curso IdCursoNavigation { get; set; } = null!;

    public virtual Modulo IdModuloNavigation { get; set; } = null!;
}
