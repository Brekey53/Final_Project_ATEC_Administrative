package pt.atec.hawk_portal_app.states

import pt.atec.hawk_portal_app.model.AvaliacaoFormando

data class AvaliacoesUiState(
    val loading: Boolean = false,
    val success: Boolean = false,
    val avaliacoes: List<AvaliacaoFormando> = emptyList(),
    val message: String? = null
)