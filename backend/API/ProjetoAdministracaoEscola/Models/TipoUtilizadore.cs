using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class TipoUtilizadore
{
    public int IdTipoUtilizador { get; set; }

    public string TipoUtilizador { get; set; } = null!;

    public virtual ICollection<Utilizador> Utilizadores { get; set; } = new List<Utilizador>();
}
