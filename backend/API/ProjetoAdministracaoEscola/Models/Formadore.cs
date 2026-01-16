using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Formadore
{
    public int IdFormador { get; set; }

    public int IdUtilizador { get; set; }

    public string Nome { get; set; } = null!;

    public string Nif { get; set; } = null!;

    public string? Phone { get; set; } = null!;

    public DateOnly DataNascimento { get; set; }

    public string Sexo { get; set; } = null!;

    public string Morada { get; set; } = null!;

    public byte[]? Fotografia { get; set; }

    public byte[]? AnexoFicheiro { get; set; }

    public virtual ICollection<DisponibilidadeFormadore> DisponibilidadeFormadores { get; set; } = new List<DisponibilidadeFormadore>();

    public virtual ICollection<Horario> Horarios { get; set; } = new List<Horario>();

    public virtual Utilizador IdUtilizadorNavigation { get; set; } = null!;

    public virtual ICollection<TurmaAlocaco> TurmaAlocacos { get; set; } = new List<TurmaAlocaco>();
}
