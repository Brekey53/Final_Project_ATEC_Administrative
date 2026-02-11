package pt.atec.hawk_portal_app.model

data class DisponibilidadeSalas(
    val idSala: Int,
    val nomeSala: String?,
    val tipo: String?,
    val capacidade: Int
)