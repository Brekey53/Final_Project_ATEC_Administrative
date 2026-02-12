using System.ComponentModel.DataAnnotations;

namespace ProjetoAdministracaoEscola.ModelsDTO.Modulo
{
    public class ModuloGetByIdDTO
    {
        public int IdModulo { get; set; }
        public string? CodigoIdentificacao { get; set; }
        public string? Nome { get; set; }
        public int HorasTotais { get; set; }
        public decimal Creditos { get; set; }
        public int IdTipoMateria { get; set; }
        public string? NomeTipoMateria { get; set; }

    }
}
