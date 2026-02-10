package pt.atec.hawk_portal_app.states

data class LoginUiState(
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val message: String = ""
)
