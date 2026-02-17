package pt.atec.hawk_portal_app.api

import android.content.Context
import okhttp3.OkHttpClient
import pt.atec.hawk_portal_app.dataStore.TokenInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

/**
 * Responsável por criar e configurar uma instância de Retrofit
 * para comunicação com a API.
 *
 * Este objeto configura:
 * - A URL base da API - ligação ao backend
 * - O cliente HTTP com um interceptor para (tokenInterceptor) para colocar TOKEN no header
 * authorization
 * - O conversor Gson para serialização e desserialização de JSON.
 */
object RetrofitClient {

    /**
     * URL base da API.
     *
     * Neste caso, 10.0.2.2 é usado para aceder ao localhost
     * da máquina host quando a app corre no emulador Android. e 5056 é a porta HTTP onde
     * corre o backend
     */
    private const val BASE_URL = "http://10.0.2.2:5056/api/"

    /**
     * Cria e devolve uma implementação da interface [ApiService]
     * configurada com autenticação baseada em token.
     *
     * @param context Contexto da aplicação necessário para que o
     * TokenInterceptor possa aceder ao armazenamento local
     *  para obter o token.
     *
     * @return Instância configurada de [ApiService] para ser utilizada
     * para realizar chamadas à API.
     */
    fun create(context: Context): ApiService {

        val client = OkHttpClient.Builder()
            .addInterceptor(TokenInterceptor(context))
            .build()

        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
