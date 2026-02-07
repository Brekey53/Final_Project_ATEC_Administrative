package pt.atec.hawk_portal_app.model

data class LoginResponse(
    val requires2FA: Boolean,
    val message: String,
    val email: String
)