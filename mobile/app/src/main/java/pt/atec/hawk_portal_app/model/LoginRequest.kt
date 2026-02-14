package pt.atec.hawk_portal_app.model

data class LoginRequest(
    val email: String,
    val password: String
)