namespace ProjetoAdministracaoEscola.ModelsDTO.Formador
{
    public class FormadorTurmaDTO
    {
        public int IdFormador { get; set; }
        public string NomeFormador { get; set; } = string.Empty;

        public int IdModulo { get; set; }
        public string NomeModulo { get; set; } = string.Empty;

        public double HorasDadas { get; set; }
    }
}
