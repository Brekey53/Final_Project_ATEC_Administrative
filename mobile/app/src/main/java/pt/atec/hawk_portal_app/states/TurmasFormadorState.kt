package pt.atec.hawk_portal_app.states

import pt.atec.hawk_portal_app.model.TurmaFormador

/**
 * Representa o estado da interface associado
 * à apresentação da lista de turmas do formador.
 *
 * Esta data class permite gerir estados de loading,
 * sucesso e erro, além de guardar a lista de turmas
 * para a camada de apresentação.
 */
data class TurmasFormadorUiState(
    val loading: Boolean = false,
    val success: Boolean = false,
    val turmas: List<TurmaFormador> = emptyList(),
    val message: String? = null
)