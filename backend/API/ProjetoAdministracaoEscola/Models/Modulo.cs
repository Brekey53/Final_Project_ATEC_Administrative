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

    public int IdTipoMateria { get; set; }

    public bool Ativo { get; set; }

    public DateTime? DataDesativacao { get; set; }

    public virtual ICollection<Avaliacao> Avaliacos { get; set; } = new List<Avaliacao>();

    public virtual ICollection<CursosModulo> CursosModulos { get; set; } = new List<CursosModulo>();

    public virtual TipoMateria IdTipoMateriaNavigation { get; set; } = null!;

    public virtual ICollection<TurmaAlocaco> TurmaAlocacos { get; set; } = new List<TurmaAlocaco>();
}
