package pt.atec.hawk_portal_app.model

data class TurmasFormando(
    val nomeTurma: String,
    val nomeCurso: String,
    val dataInicio: String,
    val dataFim: String,
    val estado: String,
    val colegas: List<Colegas> = emptyList(),
    val professores: List<ProfessoresTurmaFormando> = emptyList(),
    val modulos: List<ModulosTurmaFormandos> = emptyList()
)