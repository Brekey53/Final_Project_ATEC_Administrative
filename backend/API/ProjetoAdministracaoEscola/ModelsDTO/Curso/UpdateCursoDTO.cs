namespace ProjetoAdministracaoEscola.ModelsDTO.Curso
{
    public class UpdateCursoDTO
    {
        public string Nome { get; set; } = null!;
        public int IdArea { get; set; }
        public List<CursoModuloUpdateDTO> Modulos { get; set; }
    }
}
