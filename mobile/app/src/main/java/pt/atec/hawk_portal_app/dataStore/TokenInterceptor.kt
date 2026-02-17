package pt.atec.hawk_portal_app.dataStore

import android.content.Context
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response

/**
 * Interceptor responsável por adicionar automaticamente
 * o token de autenticação aos pedidos HTTP realizados pelo OkHttp.
 *
 * Este interceptor obtém o token armazenado no DataStore
 * e adiciona-o ao header "Authorization" no formato:
 *
 * Authorization: Bearer <token>
 *
 * Caso não exista token guardado, o pedido é enviado sem
 * o header de autenticação.
 *
 * @property context Contexto necessário para aceder ao TokenDataStore.
 */
class TokenInterceptor(private val context: Context) : Interceptor {

    /**
     * Interceta cada pedido HTTP antes de ser enviado.
     *
     * @param chain Cadeia de interceptação do OkHttp.
     *
     * @return Response devolvida pelo servidor após o pedido HTTP.
     */
    override fun intercept(chain: Interceptor.Chain): Response {

        val token = runBlocking {
            TokenDataStore.getToken(context).first()
        }

        val requestBuilder = chain.request().newBuilder()

        token?.let {
            requestBuilder.addHeader("Authorization", "Bearer $it")
        }

        val response = chain.proceed(requestBuilder.build())

        return response
    }
}
