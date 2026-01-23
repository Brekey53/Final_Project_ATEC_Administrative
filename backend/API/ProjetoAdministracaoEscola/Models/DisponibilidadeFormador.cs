using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class DisponibilidadeFormador
{
    public int IdDispFormador { get; set; }

    public int IdFormador { get; set; }

    public DateOnly DataDisponivel { get; set; }

    public TimeOnly HoraInicio { get; set; }

    public TimeOnly HoraFim { get; set; }

    public virtual Formador IdFormadorNavigation { get; set; } = null!;
}
