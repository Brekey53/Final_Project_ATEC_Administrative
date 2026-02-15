package pt.atec.hawk_portal_app.model

data class Verify2FAResponse(
    val token: String,
    val message: String
)