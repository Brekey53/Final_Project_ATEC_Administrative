using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Formando
{
    public int IdFormando { get; set; }
    public int IdUtilizador { get; set; }
    public int? IdEscolaridade { get; set; }
    public byte[]? Fotografia { get; set; }
    public byte[]? AnexoFicheiro { get; set; }

    public bool Ativo { get; set; }
    public DateTime? DataDesativacao { get; set; }

    public virtual Utilizador IdUtilizadorNavigation { get; set; } = null!;
    public virtual Escolaridade? IdEscolaridadeNavigation { get; set; }
    public virtual ICollection<Inscrico> Inscricos { get; set; } = new List<Inscrico>();
}

