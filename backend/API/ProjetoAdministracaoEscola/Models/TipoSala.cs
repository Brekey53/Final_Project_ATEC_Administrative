namespace ProjetoAdministracaoEscola.Models
{
    public class TipoSala
    {
        public int IdTipoSala { get; set; }
        public string Nome { get; set; } = null!;
        public ICollection<Sala> Salas { get; set; } = new List<Sala>();
    }

}
