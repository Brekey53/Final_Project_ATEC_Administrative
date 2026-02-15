package pt.atec.hawk_portal_app.states

import pt.atec.hawk_portal_app.model.TurmaFormador

data class TurmasFormadorUiState(
    val loading: Boolean = false,
    val success: Boolean = false,
    val turmas: List<TurmaFormador> = emptyList(),
    val message: String? = null
)