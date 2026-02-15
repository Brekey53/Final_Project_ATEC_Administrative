package pt.atec.hawk_portal_app.model

/**
 * Representa um formando registado no sistema.
 *
 * Esta data class é utilizada para guardar informação
 * pessoal e académica do formando
 */
data class Formando(
    val idFormador: Int,
    val nome: String?,
    val email: String?,
    val telefone: String?,
    val escolaridade: String?,
    val fotoUrl: String?
)
