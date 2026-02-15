using ProjetoAdministracaoEscola.ModelsDTO.Formador.Responses;

namespace ProjetoAdministracaoEscola.ModelsDTO.GetMinhaTurma.Requests
{
    public class MinhaTurma_ModuloDTO
    {
        public int IdModulo { get; set; }
        public string Nome { get; set; }
        public int HorasTotais { get; set; }

        public List<AvaliacaoDTO> Avaliacoes { get; set; } = new();
        public List<ProfessorDTO> Professores { get; set; } = new();
    }
}
