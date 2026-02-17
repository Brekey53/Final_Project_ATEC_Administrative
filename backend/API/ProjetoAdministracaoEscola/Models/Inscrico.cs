using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Inscrico
{
    public int IdInscricao { get; set; }

    public int IdFormando { get; set; }

    public int IdTurma { get; set; }

    public DateOnly DataInscricao { get; set; }

    public string? Estado { get; set; }

    public decimal? NotaFinal { get; set; }

    public virtual ICollection<Avaliacao> Avaliacos { get; set; } = new List<Avaliacao>();

    public virtual Formando IdFormandoNavigation { get; set; } = null!;

    public virtual Turma IdTurmaNavigation { get; set; } = null!;
}
