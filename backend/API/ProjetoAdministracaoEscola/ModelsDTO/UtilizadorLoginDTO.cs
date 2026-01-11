using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.Models.ModelsDTO;

public partial class UtilizadorLoginDTO
{
    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;
}
