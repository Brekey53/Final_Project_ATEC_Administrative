using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.ModelsDTO.Users;

public partial class UtilizadorRegisterDTO
{
    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Nome { get; set; } = null!;

    public string Nif { get; set; } = null!;

    public DateOnly DataNascimento { get; set; }

    public string Telefone { get; set; }

    public string Sexo { get; set; }

    public string Morada { get; set; }
}
