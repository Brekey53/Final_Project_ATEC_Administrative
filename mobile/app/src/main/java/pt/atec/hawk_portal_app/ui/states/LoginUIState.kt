package pt.atec.hawk_portal_app.ui.states

data class LoginUIState(
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val message: String = ""
)
