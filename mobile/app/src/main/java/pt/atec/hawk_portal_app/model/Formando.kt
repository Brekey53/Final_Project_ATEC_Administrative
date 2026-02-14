package pt.atec.hawk_portal_app.model

data class Formando(
    val idFormador: Int,
    val nome: String?,
    val email: String?,
    val telefone: String?,
    val escolaridade: String?,
    val fotoUrl: String?
)