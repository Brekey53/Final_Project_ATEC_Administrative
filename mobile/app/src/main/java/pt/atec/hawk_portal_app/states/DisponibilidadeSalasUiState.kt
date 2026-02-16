package pt.atec.hawk_portal_app.states

import pt.atec.hawk_portal_app.model.DisponibilidadeSalas

/**
 * Representa os diferentes estados possíveis da interface
 * associada à pesquisa de disponibilidade de salas.
 */
sealed class DisponibilidadeSalasUiState {

    /**
     * Estado apresentado enquanto os módulos
     * estão a ser carregados.
     */
    object LoadingModulos : DisponibilidadeSalasUiState()

    /**
     * Estado principal da interface quando os dados
     * necessários já foram carregados.
     *
     * Inclui:
     * - Lista de salas encontradas.
     * - Filtros aplicados (data e intervalo horário).
     * - Indicadores de carregamento e estado da pesquisa.
     */
    data class Ready(
        val modulos: List<String> = emptyList(),
        val salas: List<DisponibilidadeSalas> = emptyList(),
        val dataTexto: String = "",
        val idCursoModulo: Int? = null,
        val horaInicioTexto: String = "",
        val horaFimTexto: String = "",
        val loadingSalas: Boolean = false,
        val pesquisaFeita: Boolean = false,
        val erroValidacao: String? = null
    ) : DisponibilidadeSalasUiState()

    /**
     * Estado de erro apresentado quando ocorre
     * uma falha
     */
    data class Error(val message: String) : DisponibilidadeSalasUiState()
}
