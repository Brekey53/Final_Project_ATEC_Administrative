package pt.atec.hawk_portal_app.states

/**
 * Representa o estado da interface associado ao processo de login.
 *
 * Esta data class é utilizada para controlar a apresentação
 * de indicadores de loading, sucesso e mensagens ou de erro durante o login.
 */
data class LoginUiState(
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val message: String = ""
)