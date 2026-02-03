using ProjetoAdministracaoEscola.ModelsDTO.Formador;

namespace ProjetoAdministracaoEscola.ModelsDTO.GetMinhaTurma
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
