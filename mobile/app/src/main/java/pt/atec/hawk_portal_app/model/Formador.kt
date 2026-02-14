package pt.atec.hawk_portal_app.model

data class Formador(
    val idFormador: Int,
    val nome: String?,
    val email: String?,
    val telefone: String?,
    val qualificacoes: String?,
    val fotoUrl: String?
)
