package pt.atec.hawk_portal_app.utils

import android.util.Base64
import org.json.JSONObject

object JwtUtils {
    fun getTipoUtilizador(token: String): Int? {
        return try {
            val parts = token.split(".")
            if (parts.size < 2) return null

            val payload = parts[1]

            val decodedBytes = Base64.decode(
                payload,
                Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING
            )

            val decodedString = String(decodedBytes)

            val json = JSONObject(decodedString)

            json.optString("tipoUtilizador", null)?.toIntOrNull()
        } catch (e: Exception) {
            null
        }
    }
}
