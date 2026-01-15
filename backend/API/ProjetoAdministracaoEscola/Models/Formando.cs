using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Formando
{
    public int IdFormando { get; set; }

    public int IdUtilizador { get; set; }

    public string Nome { get; set; } = null!;

    public string Nif { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public DateOnly DataNascimento { get; set; }

    public string Morada { get; set; } = null!;

    public byte[]? Fotografia { get; set; }

    public byte[]? AnexoFicheiro { get; set; }

    public virtual Utilizador IdUtilizadorNavigation { get; set; } = null!;

    public virtual ICollection<Inscrico> Inscricos { get; set; } = new List<Inscrico>();
}
