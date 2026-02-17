package pt.atec.hawk_portal_app.model

/**
 * Representa o corpo de um pedido de verificação
 * de autenticação de dois fatores (2FA).
 *
 * Esta data class é utilizada para enviar à API
 * o email do utilizador e o código de verificação
 * introduzido, concluindo o processo de autenticação.
 */
data class Verify2FARequest(
    val email: String,
    val code: String,
)