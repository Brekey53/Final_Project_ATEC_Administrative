package pt.atec.hawk_portal_app.model

/**
 * Representa o corpo de um pedido de login.
 *
 * Esta data class é utilizada para enviar as credenciais
 * do utilizador para a API durante o processo de login.
 */
data class LoginRequest(
    val email: String,
    val password: String
)
