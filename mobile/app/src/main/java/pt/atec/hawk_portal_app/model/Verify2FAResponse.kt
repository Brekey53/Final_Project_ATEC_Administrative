package pt.atec.hawk_portal_app.model

/**
 * Representa a resposta devolvida pela API após
 * a verificação bem-sucedida do código 2FA.
 *
 * Contém o token de autenticação emitido pelo servidor
 * e uma mensagem associada ao resultado da operação.
 */
data class Verify2FAResponse(
    val token: String,
    val message: String
)
