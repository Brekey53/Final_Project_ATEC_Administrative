using ProjetoAdministracaoEscola.ModelsDTO.Horario.Requests;

namespace ProjetoAdministracaoEscola.ModelsDTO.Horario.Responses
{
    public class HorarioGeradorResultado
    {
        public List<Models.Horario> HorariosGerados { get; set; } = new List<Models.Horario>();
        public List<ResumoAgendamentoModulo> ResumoModulos { get; set; } = new List<ResumoAgendamentoModulo>();
    }
}
