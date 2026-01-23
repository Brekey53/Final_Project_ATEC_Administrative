using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Escolaridade
{
    public int IdEscolaridade { get; set; }

    public string Nivel { get; set; } = null!;

    public virtual ICollection<Formando> Formandos { get; set; } = new List<Formando>();
}
