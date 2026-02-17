using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class TipoMateria
{
    public int IdTipoMateria { get; set; }

    public string Tipo { get; set; } = null!;

    public virtual ICollection<Modulo> Modulos { get; set; } = new List<Modulo>();
    public virtual ICollection<FormadorTipoMateria> FormadoresTipoMaterias { get; set; } = new List<FormadorTipoMateria>();

    //public virtual ICollection<Formador> IdFormadors { get; set; } = new List<Formador>();

    public virtual ICollection<TipoSala> IdTipoSalas { get; set; } = new List<TipoSala>();
}
