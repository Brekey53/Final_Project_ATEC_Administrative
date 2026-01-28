namespace ProjetoAdministracaoEscola.ModelsDTO
{
    public class CursoDTO
    {
        public int IdCurso { get; set; }
        public string Nome { get; set; }
        public int IdArea { get; set; }
        public string NomeArea { get; set; }
        public List<ModuloDTO>? Modulos { get; set; }
    }
}
