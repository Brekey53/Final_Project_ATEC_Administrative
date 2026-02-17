namespace ProjetoAdministracaoEscola.ModelsDTO.DisponibilidadeFormador.Responses
{
    public class DisponibilidadeFormadorDTO
    {
        public int Id { get; set; }

        public int IdFormador {get; set;}

        public DateOnly Data { get; set;}

        public TimeOnly HoraInicio { get; set;}

        public TimeOnly HoraFim { get; set; }

        public bool EstaMarcado { get; set; }
        public string Tipo { get; set; }
    }
}
