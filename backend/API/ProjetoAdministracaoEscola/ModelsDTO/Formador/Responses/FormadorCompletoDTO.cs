using ProjetoAdministracaoEscola.ModelsDTO.TipoMateria.Responses;

namespace ProjetoAdministracaoEscola.ModelsDTO.Formador.Responses
{
    public class FormadorCompletoDTO
    {
       public int IdFormador { get; set; }

        public int IdUtilizador { get; set; }

        public string? Iban { get; set; }

        public string? Qualificacoes { get; set; }

        public string Nome { get; set; } = null!;

        public string Nif { get; set; } = null!;

        public DateOnly DataNascimento { get; set; }

        public string? Morada { get; set; }

        public string? Telefone { get; set; }

        public string? Sexo { get; set; }

        public string Email { get; set; } = null!;

        public string? Fotografia { get; set; }

        public string? AnexoFicheiro { get; set; }

        public List<TipoMateriaDTO> TiposMateria { get; set; } = new();
    }

}
