package pt.atec.hawk_portal_app.model

/**
 * Representa uma turma associada a um formador.
 *
 * Esta data class contém informação sobre a turma,
 * o módulo lecionado, horas dadas, horas totais e estado atual
 */
data class TurmaFormador(
    val idTurma: Int,
    val idModulo: Int,
    val nomeTurma: String,
    val nomeCurso: String,
    val nomeModulo: String,
    val horasDadas: Int,
    val horasTotaisModulo: Int,
    val estado: String
)
