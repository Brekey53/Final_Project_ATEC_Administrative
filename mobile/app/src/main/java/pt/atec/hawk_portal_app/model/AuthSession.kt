package pt.atec.hawk_portal_app.model

/**
 * Representa a sessão de autenticação ativa da aplicação.
 *
 * Este objeto mantém o email em memória sobre o utilizador
 * autenticado durante o ciclo de vida do processo da app.
 *
 */
object AuthSession {
    var email: String? = null
}
