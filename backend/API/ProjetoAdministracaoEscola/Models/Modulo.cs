using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Modulo
{
    public int IdModulo { get; set; }

    public string? CodigoIdentificacao { get; set; }

    public string Nome { get; set; } = null!;

    public int HorasTotais { get; set; }

    public decimal Creditos { get; set; }

    public virtual ICollection<Avaliaco> Avaliacos { get; set; } = new List<Avaliaco>();

    public virtual ICollection<CursosModulo> CursosModulos { get; set; } = new List<CursosModulo>();

    public virtual ICollection<Horario> Horarios { get; set; } = new List<Horario>();

    public virtual ICollection<TurmaAlocaco> TurmaAlocacos { get; set; } = new List<TurmaAlocaco>();
}
