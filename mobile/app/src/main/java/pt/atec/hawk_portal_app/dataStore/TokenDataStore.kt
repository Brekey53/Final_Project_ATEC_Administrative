package pt.atec.hawk_portal_app.dataStore

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map


/**
 * Extensão de Context que cria uma instância do DataStore
 * para armazenar preferências relacionadas com a autenticação.
 *
 * O ficheiro físico criado será "auth_prefs.preferences_pb".
 */
private val Context.dataStore by preferencesDataStore(name = "auth_prefs")

/**
 * Objeto responsável por gerir o armazenamento e recuperação
 * do token de autenticação usando a DataStore.
 *
 */
object TokenDataStore {

    /**
     * Chave usada para guardar o token de autenticação
     * nas preferências do DataStore.
     */
    private val TOKEN_KEY = stringPreferencesKey("auth_token")

    /**
     * Devolve um Flow que emite o token de autenticação atual.
     *
     * Sempre que o valor armazenado for alterado,
     * o Flow emitirá automaticamente o novo valor.
     *
     * @param context Contexto da aplicação
     * para aceder ao DataStore.
     *
     * @return Flow que emite o token armazenado ou null
     * caso ainda não exista nenhum token guardado.
     */
    fun getToken(context: Context): Flow<String?> =
        context.dataStore.data.map { prefs ->
            prefs[TOKEN_KEY]
        }

    /**
     * Guarda ou atualiza o token de autenticação no DataStore.
     *
     * @param context Contexto da aplicação.
     * @param token Token de autenticação a armazenar.
     */
    suspend fun saveToken(context: Context, token: String) {
        context.dataStore.edit { prefs ->
            prefs[TOKEN_KEY] = token
        }
    }

    /**
     * Obtém o token de autenticação apenas uma vez.
     *
     * Diferente de [getToken], esta função não observa alterações,
     * apenas devolve o valor atual armazenado.
     *
     * @param context Contexto da aplicação.
     *
     * @return Token armazenado ou null caso não exista.
     */
    suspend fun getTokenOnce(context: Context): String? {
        return getToken(context).first()
    }

}

