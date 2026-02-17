using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class TipoSala
{
    public int IdTipoSala { get; set; }

    public string Nome { get; set; } = null!;

    public virtual ICollection<Sala> Salas { get; set; } = new List<Sala>();

    public virtual ICollection<TipoMateria> IdTipoMateria { get; set; } = new List<TipoMateria>();
}
