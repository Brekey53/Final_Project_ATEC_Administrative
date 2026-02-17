package pt.atec.hawk_portal_app.model

/**
 * Representa a disponibilidade de uma sala no sistema.
 *
 * Esta data class é utilizada para guardar informação
 * relacionada com identificação, tipologia e capacidade
 * da sala para consultas de disponibilidade.
 */
data class DisponibilidadeSalas(
    val idSala: Int,
    val nomeSala: String?,
    val tipo: String?,
    val capacidade: Int
)

