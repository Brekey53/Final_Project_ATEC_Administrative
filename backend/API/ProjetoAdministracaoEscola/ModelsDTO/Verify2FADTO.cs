using System.ComponentModel.DataAnnotations;

namespace ProjetoAdministracaoEscola.ModelsDTO
{
    public class Verify2FADTO
    {
        [Required, EmailAddress]
        public string Email { get; set; }

        [Required, MinLength(6), MaxLength(6)]
        public string Code { get; set; }
    }
}
