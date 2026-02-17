using System.ComponentModel.DataAnnotations;

namespace ProjetoAdministracaoEscola.ModelsDTO.Modulo.Responses
{
    public class ModulosGetAll
    {
        public int IdModulo { get; set; }
        public string? CodigoIdentificacao { get; set; }
        public string? Nome { get; set; }
        public int HorasTotais { get; set; }
        public decimal Creditos { get; set; }

    }
}
