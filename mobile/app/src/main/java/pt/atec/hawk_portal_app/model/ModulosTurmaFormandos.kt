package pt.atec.hawk_portal_app.model

data class ModulosTurmaFormandos (
    val idModulo: Int,
    val nome: String,
    val horasTotais: Int,
    val avaliacoes: List<AvaliacaoFormando> = emptyList(),
    val professores: List<ProfessoresTurmaFormando> = emptyList()
)