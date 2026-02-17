using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Formador
{
    public int IdFormador { get; set; }

    public int IdUtilizador { get; set; }

    public string? Iban { get; set; }

    public string? Qualificacoes { get; set; }

    public byte[]? Fotografia { get; set; }

    public byte[]? AnexoFicheiro { get; set; }

    public bool Ativo { get; set; }

    public DateTime? DataDesativacao { get; set; }

    public virtual ICollection<DisponibilidadeFormador> DisponibilidadeFormadores { get; set; } = new List<DisponibilidadeFormador>();
    public virtual ICollection<FormadorTipoMateria> FormadoresTipoMaterias { get; set; } = new List<FormadorTipoMateria>();

    public virtual ICollection<Horario> Horarios { get; set; } = new List<Horario>();

    public virtual Utilizador IdUtilizadorNavigation { get; set; } = null!;

    public virtual ICollection<TurmaAlocaco> TurmaAlocacos { get; set; } = new List<TurmaAlocaco>();

    //public virtual ICollection<TipoMateria> IdTipoMateria { get; set; } = new List<TipoMateria>();
}
