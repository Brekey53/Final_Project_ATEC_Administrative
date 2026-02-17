package pt.atec.hawk_portal_app.states

import pt.atec.hawk_portal_app.model.Formando

/**
 * Representa o estado da interface do ecrã de formandos.
 *
 * @property loading Indica se os dados estão a ser carregados.
 * @property formandos Lista de formandos obtida da API.
 * @property error Mensagem de erro caso ocorra falha.
 */
data class FormandosUiState(
    val loading: Boolean = false,
    val formandos: List<Formando> = emptyList(),
    val error: String? = null
)