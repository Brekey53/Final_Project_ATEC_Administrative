namespace ProjetoAdministracaoEscola.ModelsDTO.Turma
{
    public class MetodologiaDTO
    {
        public int IdMetodologia { get; set; }

        public string Nome { get; set; } = null!;

        public TimeOnly HorarioInicio { get; set; }

        public TimeOnly HorarioFim { get; set; }

        public TimeOnly PausaRefeicaoInicio { get; set; }

        public TimeOnly PausaRefeicaoFim { get; set; }
    }
}
