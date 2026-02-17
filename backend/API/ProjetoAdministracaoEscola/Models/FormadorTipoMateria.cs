namespace ProjetoAdministracaoEscola.Models
{
    public partial class FormadorTipoMateria
    {
        public int IdFormador { get; set; }
        public int IdTipoMateria { get; set; }

        public virtual Formador Formador { get; set; } = null!;
        public virtual TipoMateria TipoMateria { get; set; } = null!;
    }

}
