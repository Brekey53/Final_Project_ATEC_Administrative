using System.ComponentModel.DataAnnotations;

namespace ProjetoAdministracaoEscola.ModelsDTO
{
    public class ModuloUpdateDTO
    {
        public int IdModulo { get; set; }

        [Required(ErrorMessage = "O nome do módulo é obrigatório.")]
        [StringLength(150, ErrorMessage = "O nome não pode exceder os 150 caracteres.")]
        public string Nome { get; set; }

        [Required(ErrorMessage = "O código de identificação é obrigatório.")]
        public string CodigoIdentificacao { get; set; }

        [Range(1, 1000, ErrorMessage = "As horas devem estar entre 1 e 1000.")]
        public int HorasTotais { get; set; }

        [Range(0, 100, ErrorMessage = "Os créditos devem estar entre 0 e 100.")]
        public decimal Creditos { get; set; }
    }
}
