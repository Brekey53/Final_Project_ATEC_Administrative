namespace ProjetoAdministracaoEscola.ModelsDTO.Horario
{
    public class HorarioGeradorResultado
    {
        public List<ProjetoAdministracaoEscola.Models.Horario> HorariosGerados { get; set; } = new List<ProjetoAdministracaoEscola.Models.Horario>();
        public List<ResumoAgendamentoModulo> ResumoModulos { get; set; } = new List<ResumoAgendamentoModulo>();
    }
}
