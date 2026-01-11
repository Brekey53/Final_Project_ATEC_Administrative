using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Utilizador
{
    public int IdUtilizador { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? IdGoogle { get; set; } = string.Empty!;

    public string? IdFacebook { get; set; } = string.Empty!;

    public int IdTipoUtilizador { get; set; } = 5; // Default 5 = Geral

    public bool? StatusAtivacao { get; set; }

    public string? TokenAtivacao { get; set; } // Usado para ativação de conta via email

    public virtual ICollection<Formadore> Formadores { get; set; } = new List<Formadore>();

    public virtual ICollection<Formando> Formandos { get; set; } = new List<Formando>();

    public virtual TipoUtilizadore IdTipoUtilizadorNavigation { get; set; } = null!;

    
}
