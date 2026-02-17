using System;
using System.Collections.Generic;

namespace ProjetoAdministracaoEscola.ModelsDTO.Users.Requests;

public partial class UtilizadorLoginDTO
{
    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;
}
