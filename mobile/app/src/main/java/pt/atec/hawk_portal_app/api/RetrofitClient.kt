package pt.atec.hawk_portal_app.api

import android.content.Context
import okhttp3.OkHttpClient
import pt.atec.hawk_portal_app.dataStore.TokenInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {

    private const val BASE_URL = "http://10.0.2.2:5056/api/"

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
