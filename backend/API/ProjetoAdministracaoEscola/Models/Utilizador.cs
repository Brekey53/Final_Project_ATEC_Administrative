using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Utilizadore
{
    public int IdUtilizador { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? IdGoogle { get; set; }

    public string? IdFacebook { get; set; }

    public int IdTipoUtilizador { get; set; }

    public bool? StatusAtivacao { get; set; }

    public virtual ICollection<Formadore> Formadores { get; set; } = new List<Formadore>();

    public virtual ICollection<Formando> Formandos { get; set; } = new List<Formando>();

    public virtual TipoUtilizadore IdTipoUtilizadorNavigation { get; set; } = null!;
}
