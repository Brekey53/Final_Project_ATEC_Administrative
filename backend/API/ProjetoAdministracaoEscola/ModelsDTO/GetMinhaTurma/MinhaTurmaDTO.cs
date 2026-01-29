namespace ProjetoAdministracaoEscola.ModelsDTO.GetMinhaTurma
{
    public class MinhaTurmaDTO
    {
        public string NomeTurma { get; set; }
        public string NomeCurso { get; set; }

        public DateOnly DataInicio { get; set; }
        public DateOnly DataFim { get; set; }

        public string Estado { get; set; }

        public List<ColegaDTO> Colegas { get; set; } = new();
        public List<ProfessorDTO> Professores { get; set; } = new();
        public List<MinhaTurma_ModuloDTO> Modulos { get; set; } = new();
    }

}
