package pt.atec.hawk_portal_app.model

/**
 * Representa um formador registado no sistema.
 *
 * Esta data class é utilizada para guardar informação
 * de contacto do formador
 */
data class Formador(
    val idFormador: Int,
    val nome: String?,
    val email: String?,
    val telefone: String?,
    val qualificacoes: String?,
    val fotoUrl: String?
)


