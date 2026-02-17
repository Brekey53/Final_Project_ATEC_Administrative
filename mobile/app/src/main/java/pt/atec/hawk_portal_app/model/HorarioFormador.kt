package pt.atec.hawk_portal_app.model

/**
 * Representa um registo de horário de um formador.
 *
 * Esta data class contém informação detalhada sobre uma sessão,
 * incluindo data, intervalo horário, sala, turma e módulo
 */
data class HorarioFormador(
    val idHorario: Int,
    val data: String,
    val horaInicio: String,
    val horaFim: String,
    val nomeSala: String,
    val nomeTurma: String,
    val nomeModulo: String
)
