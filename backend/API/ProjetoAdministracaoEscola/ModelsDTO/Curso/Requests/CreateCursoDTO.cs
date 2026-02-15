using System.ComponentModel.DataAnnotations;

namespace ProjetoAdministracaoEscola.ModelsDTO.Curso.Requests
{
    public class CreateCursoDTO
    {
        [Required]
        public string Nome { get; set; }

        [Required]
        public int IdArea { get; set; }

        public string? Descricao { get; set; }
    }
}
