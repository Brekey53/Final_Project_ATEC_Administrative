using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models;

public partial class Curso
{
    public int IdCurso { get; set; }

    public int IdArea { get; set; }

    public string Nome { get; set; } = null!;

    public string? Descricao { get; set; }

    public bool Ativo { get; set; }

    public DateTime? DataDesativacao { get; set; }

    public virtual ICollection<CursosModulo> CursosModulos { get; set; } = new List<CursosModulo>();

    public virtual Area IdAreaNavigation { get; set; } = null!;

    public virtual ICollection<Turma> Turmas { get; set; } = new List<Turma>();
}
