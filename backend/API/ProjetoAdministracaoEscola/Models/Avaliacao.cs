using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Avaliacao
{
    public int IdAvaliacao { get; set; }

    public int IdInscricao { get; set; }

    public int IdModulo { get; set; }

    public decimal? Nota { get; set; }

    public DateOnly? DataAvaliacao { get; set; }

    public virtual Inscrico IdInscricaoNavigation { get; set; } = null!;

    public virtual Modulo IdModuloNavigation { get; set; } = null!;
}
