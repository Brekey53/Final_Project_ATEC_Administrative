package pt.atec.hawk_portal_app.utils

import android.util.Base64
import org.json.JSONObject

/**
 * Objeto responsável por operações relacionadas com tokens JWT.
 *
 * Contém função para extrair tipo utilizador do token
 */
object JwtUtils {
    /**
     * Extrai o campo "tipoUtilizador" de um token JWT.
     * - Divide o token nas suas três partes (header, payload e signature).
     * - Descodifica o payload em Base64 URL Safe.
     * - Converte o conteúdo para JSON.
     * - Obtém o valor associado à chave "tipoUtilizador".
     *
     * Caso o token seja inválido, mal formatado ou não contenha
     * o campo esperado, a função devolve null.
     *
     * @param token Token JWT em formato String.
     * @return Tipo de utilizador como Int, ou null caso não seja possível extrair.
     */
    fun getTipoUtilizador(token: String): Int? {
        return try {
            val parts = token.split(".")
            if (parts.size < 2)
                return null

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
