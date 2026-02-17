package pt.atec.hawk_portal_app.states

/**
 * Representa uma estrutura de erro devolvida pela API.
 *
 * Esta data class é utilizada para desserializar respostas
 * de erro, permitindo extrair a mensagem enviada pelo servidor em JSON
 * e tratá-la na aplicação.
 */
data class ApiError(
    val message: String? = null
)