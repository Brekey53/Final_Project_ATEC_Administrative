package pt.atec.hawk_portal_app.model

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