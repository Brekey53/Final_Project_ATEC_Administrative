package pt.atec.hawk_portal_app.states

import pt.atec.hawk_portal_app.model.TurmasFormando

data class TurmasFormandoUiState (
    val loading: Boolean = false,
    val success: Boolean = false,
    val turma: TurmasFormando? = null,
    val message: String? = null
)
