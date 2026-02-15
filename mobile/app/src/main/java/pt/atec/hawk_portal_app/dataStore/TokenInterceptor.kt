package pt.atec.hawk_portal_app.dataStore

import android.content.Context
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response

class TokenInterceptor(private val context: Context) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {

        val token = runBlocking {
            TokenDataStore.getToken(context).first()
        }

        println("INTERCEPTOR TOKEN: $token")
        println("INTERCEPTOR URL: ${chain.request().url}")

        val requestBuilder = chain.request().newBuilder()

        token?.let {
            requestBuilder.addHeader("Authorization", "Bearer $it")
        }

        val response = chain.proceed(requestBuilder.build())

        println("INTERCEPTOR RESPONSE CODE: ${response.code}")

        return response
    }

}
