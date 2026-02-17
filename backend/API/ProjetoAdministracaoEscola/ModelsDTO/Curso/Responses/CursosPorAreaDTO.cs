namespace ProjetoAdministracaoEscola.ModelsDTO.Curso.Responses
{
    public class CursosPorAreaDTO
    {
        public int IdArea { get; set; }
        public string NomeArea { get; set; } = string.Empty;
        public int TotalCursos { get; set; }
    }
}
