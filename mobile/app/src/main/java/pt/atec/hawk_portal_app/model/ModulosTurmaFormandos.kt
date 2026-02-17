package pt.atec.hawk_portal_app.model

/**
 * Representa um módulo associado a uma turma de formandos.
 *
 * Esta data class agrega informação estrutural do módulo,
 * incluindo numero de horas total, avaliações desse módulo
 * e professores.
 */
data class ModulosTurmaFormandos(
    val idModulo: Int,
    val nome: String,
    val horasTotais: Int,
    val avaliacoes: List<AvaliacaoFormando> = emptyList(),
    val professores: List<ProfessoresTurmaFormando> = emptyList()
)
