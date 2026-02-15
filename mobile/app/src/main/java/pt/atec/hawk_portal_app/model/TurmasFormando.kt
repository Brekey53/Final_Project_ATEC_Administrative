package pt.atec.hawk_portal_app.model

/**
 * Representa a informação detalhada de uma turma associada a um formando.
 *
 * Esta data class agrega dados da turma,
 * incluindo período de duração, estado atual,
 * colegas, professores e módulos associados.
 */
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
