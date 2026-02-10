
package pt.atec.hawk_portal_app.model

data class Verify2FARequest(
    val email: String,
    val code: String,
)