using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class DisponibilidadeSala
{
    public int IdDispSala { get; set; }

    public int IdSala { get; set; }

    public DateOnly DataDisponivel { get; set; }

    public TimeOnly HoraInicio { get; set; }

    public TimeOnly HoraFim { get; set; }

    public virtual Sala IdSalaNavigation { get; set; } = null!;
}
