using System.ComponentModel.DataAnnotations;

namespace ProjetoAdministracaoEscola.ModelsDTO.Formando.Requests
{
    public class FormandoCompletoDTO
    {
        [EmailAddress(ErrorMessage = "Email inválido.")]
        public string? Email { get; set; } = null!;

        [MinLength(6, ErrorMessage = "A password deve ter pelo menos 6 caracteres.")]
        public string? Password { get; set; } = null!;

        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(100)]
        public string Nome { get; set; } = null!;

        [Required(ErrorMessage = "O NIF é obrigatório.")]
        [StringLength(9, MinimumLength = 9, ErrorMessage = "O NIF deve ter 9 dígitos.")]
        public string Nif { get; set; } = null!;

        [Required(ErrorMessage = "A data de nascimento é obrigatória.")]
        public DateOnly DataNascimento { get; set; }

        [Required(ErrorMessage = "A morada é obrigatória.")]
        [StringLength(100)]
        public string Morada { get; set; } = null!;

        [StringLength(13)]
        public string? Telefone { get; set; }

        [Required(ErrorMessage = "O campo sexo é obrigatório.")]
        public string? Sexo { get; set; } = null!;

        public int? IdEscolaridade { get; set; }

        public int? IdTurma { get; set; }

        public string? Estado { get; set; }
        public IFormFile? Fotografia { get; set; }
        public IFormFile? Documento { get; set; }
    }
}

