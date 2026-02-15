package pt.atec.hawk_portal_app.model

data class HorarioFormando (
    val idHorario: Int,
    val data: String,
    val horaInicio: String,
    val horaFim: String,
    val nomeSala: String,
    val nomeModulo: String
)