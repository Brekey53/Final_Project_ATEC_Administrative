using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class MetodologiasHorario
{
    public int IdMetodologia { get; set; }

    public string Nome { get; set; } = null!;

    public TimeOnly HorarioInicio { get; set; }

    public TimeOnly HorarioFim { get; set; }

    public TimeOnly PausaRefeicaoInicio { get; set; }

    public TimeOnly PausaRefeicaoFim { get; set; }

    public virtual ICollection<Turma> Turmas { get; set; } = new List<Turma>();
}
