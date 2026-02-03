using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Area
{
    public int IdArea { get; set; }

    public string Nome { get; set; } = null!;

    public virtual ICollection<Curso> Cursos { get; set; } = new List<Curso>();
}
