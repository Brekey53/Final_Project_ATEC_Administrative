using System.ComponentModel.DataAnnotations;

namespace ProjetoAdministracaoEscola.ModelsDTO
{
    public class SalaDTO
    {
        public int IdSala { get; set; } // Opcional no POST, obrigatório no PUT

        [Required(ErrorMessage = "A descrição da sala é obrigatória.")]
        [StringLength(100, ErrorMessage = "A descrição não pode exceder 100 caracteres.")]
        public string Descricao { get; set; }

        [Range(1, 200, ErrorMessage = "A lotação deve estar entre 1 e 200 alunos.")]
        public int NumMaxAlunos { get; set; }
    }
}
