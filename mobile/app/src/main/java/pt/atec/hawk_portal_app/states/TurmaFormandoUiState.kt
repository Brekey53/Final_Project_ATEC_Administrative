package pt.atec.hawk_portal_app.states

import pt.atec.hawk_portal_app.model.TurmasFormando

/**
 * Representa o estado da interface associado
 * à turma do formando.
 *
 * Esta data class permite controlar o estado de loading,
 * sucesso e erro, bem como guardar a informação da turma
 * para a UI.
 */
data class TurmasFormandoUiState(
    val loading: Boolean = false,
    val success: Boolean = false,
    val turma: TurmasFormando? = null,
    val message: String? = null
)