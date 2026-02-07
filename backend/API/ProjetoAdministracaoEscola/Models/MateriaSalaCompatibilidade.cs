namespace ProjetoAdministracaoEscola.Models
{
    public class MateriaSalaCompatibilidade
    {
        public int IdTipoMateria { get; set; }
        public int IdTipoSala { get; set; }
        public virtual TipoMateria TipoMateria { get; set; } = null!;
        public virtual TipoSala TipoSala { get; set; } = null!;
    }
}
