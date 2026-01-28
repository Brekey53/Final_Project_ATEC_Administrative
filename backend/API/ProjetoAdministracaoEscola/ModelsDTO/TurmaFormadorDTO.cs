namespace ProjetoAdministracaoEscola.ModelsDTO
{
    public class TurmaFormadorDTO
    {
        public int IdTurma { get; set; }
        public int IdModulo { get; set; }

        public string NomeTurma { get; set; }
        public string NomeCurso { get; set; }
        public string NomeModulo { get; set; }

        public double HorasDadas { get; set; }
        public int HorasTotaisModulo { get; set; }

        public string Estado { get; set; }
    }


}
