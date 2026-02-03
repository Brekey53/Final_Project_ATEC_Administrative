using ProjetoAdministracaoEscola.ModelsDTO.Curso;

namespace ProjetoAdministracaoEscola.ModelsDTO.Formando
{
    public class FichaFormandoPdfDTO
    {
        public string Nome { get; set; }
        public string Email { get; set; }
        public string Nif { get; set; }
        public byte[]? Fotografia { get; set; }
        public List<CursoAvaliacaoDTO> HistoricoCursos { get; set; }
    }
}
