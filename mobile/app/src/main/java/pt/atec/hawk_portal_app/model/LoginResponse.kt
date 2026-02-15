package pt.atec.hawk_portal_app.model

/**
 * Representa a resposta devolvida pela API após uma tentativa de login.
 *
 * Esta data class contém informação sobre o estado do login,
 * incluindo indicação se é necessária autenticação de dois fatores
 * e mensagens associadas ao resultado da operação.
 */
data class LoginResponse(
    val requires2FA: Boolean,
    val message: String,
    val email: String
)
