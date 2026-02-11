package pt.atec.hawk_portal_app.states

import pt.atec.hawk_portal_app.model.Cursos

data class CursosUiState(
    val loading: Boolean = true,
    val error: Boolean = false,
    val success: Boolean = false,
    val message: String? = null,
    val cursos: List<Cursos> = emptyList(),
)
