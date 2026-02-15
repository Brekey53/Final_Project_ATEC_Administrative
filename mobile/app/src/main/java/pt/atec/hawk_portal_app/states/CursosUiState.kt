package pt.atec.hawk_portal_app.states

import pt.atec.hawk_portal_app.model.Cursos

/**
 * Representa o estado da interface associado à listagem de cursos.
 *
 * Esta data class é utilizada para gerir estados de loading,
 * erro e sucesso, bem como guardar a lista de cursos
 * e mensagens informativas para a camada de UI.
 */
data class CursosUiState(
    val loading: Boolean = true,
    val error: Boolean = false,
    val success: Boolean = false,
    val message: String? = null,
    val cursos: List<Cursos> = emptyList(),
)

