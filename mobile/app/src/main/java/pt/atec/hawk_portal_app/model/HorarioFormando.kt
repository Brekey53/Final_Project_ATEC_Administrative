package pt.atec.hawk_portal_app.model

/**
 * Representa um registo de horário associado a um formando.
 *
 * Esta data class contém informação relativa a uma sessão
 * formativa, incluindo data, horário, sala e módulo
 */
data class HorarioFormando(
    val idHorario: Int,
    val data: String,
    val horaInicio: String,
    val horaFim: String,
    val nomeSala: String,
    val nomeModulo: String
)