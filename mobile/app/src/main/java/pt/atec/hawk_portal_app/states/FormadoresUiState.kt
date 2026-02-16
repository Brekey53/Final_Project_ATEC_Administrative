package pt.atec.hawk_portal_app.states

import pt.atec.hawk_portal_app.model.Formador

/**
 * Representa o estado da interface do ecrã de formadores.
 *
 * @property loading Indica se os dados estão a ser carregados.
 * @property formadores Lista de formadores obtidos da API.
 * @property error Mensagem de erro caso ocorra falha na obtenção dos dados.
 */
data class FormadoresUiState(
    val loading: Boolean = false,
    val formadores: List<Formador> = emptyList(),
    val error: String? = null
)
