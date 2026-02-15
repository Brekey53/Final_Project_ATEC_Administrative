using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Sala
{
    public int IdSala { get; set; }

    public string Descricao { get; set; } = null!;

    public int NumMaxAlunos { get; set; }

    public int IdTipoSala { get; set; }

    public virtual ICollection<Horario> Horarios { get; set; } = new List<Horario>();

    public virtual TipoSala IdTipoSalaNavigation { get; set; } = null!;
}
