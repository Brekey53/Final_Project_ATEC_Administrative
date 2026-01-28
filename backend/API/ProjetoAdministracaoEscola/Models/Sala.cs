using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Sala
{
    public int IdSala { get; set; }

    public int IdTipoSala { get; set; }

    public string Descricao { get; set; } = null!;

    public int NumMaxAlunos { get; set; }

    public TipoSala IdTipoSalaNavigation { get; set; } = null!;
    public virtual ICollection<DisponibilidadeSala> DisponibilidadeSalas { get; set; } = new List<DisponibilidadeSala>();

    public virtual ICollection<Horario> Horarios { get; set; } = new List<Horario>();
}
