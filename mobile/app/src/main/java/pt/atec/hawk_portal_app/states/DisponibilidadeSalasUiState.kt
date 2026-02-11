package pt.atec.hawk_portal_app.states

data class DisponibilidadeSalasState(
    val isLoading: Boolean = true,
    val hasData: Boolean = false,
    val hasError: Boolean = false
)