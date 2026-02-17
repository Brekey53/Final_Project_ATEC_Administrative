using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Utilizador
{
    public int IdUtilizador { get; set; }

    public string Nome { get; set; } = null!;

    public string Nif { get; set; } = null!;

    public DateOnly DataNascimento { get; set; }

    public string? Morada { get; set; }

    public string? Telefone { get; set; }

    public string? Sexo { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? IdGoogle { get; set; }

    public string? IdFacebook { get; set; }

    public int IdTipoUtilizador { get; set; }

    public bool? StatusAtivacao { get; set; }

    public string? TokenAtivacao { get; set; }

    public bool? Ativo { get; set; }

    public DateTime? DataDesativacao { get; set; }

    public virtual ICollection<Formador> Formadores { get; set; } = new List<Formador>();

    public virtual ICollection<Formando> Formandos { get; set; } = new List<Formando>();

    public virtual TipoUtilizadore IdTipoUtilizadorNavigation { get; set; } = null!;
}
