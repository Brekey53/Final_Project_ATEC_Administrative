package pt.atec.hawk_portal_app.states

import pt.atec.hawk_portal_app.model.DisponibilidadeSalas

sealed class DisponibilidadeSalasUiState {

    object LoadingModulos : DisponibilidadeSalasUiState()

    data class Ready(
        val modulos: List<String> = emptyList(),
        val salas: List<DisponibilidadeSalas> = emptyList(),
        val dataTexto: String = "",
        val idCursoModulo: Int? = null,
        val horaInicioTexto: String = "",
        val horaFimTexto: String = "",
        val loadingSalas: Boolean = false,
        val pesquisaFeita: Boolean = false
    ) : DisponibilidadeSalasUiState()


    data class Error(val message: String) : DisponibilidadeSalasUiState()
}
