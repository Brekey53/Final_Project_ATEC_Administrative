package pt.atec.hawk_portal_app.model

data class HorarioFormador (
    val idHorario: Int,
    val data: String,
    val horaInicio: String,
    val horaFim: String,
    val nomeSala: String,
    val nomeTurma: String,
    val nomeModulo: String
)