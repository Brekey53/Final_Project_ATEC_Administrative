package pt.atec.hawk_portal_app.api

import pt.atec.hawk_portal_app.model.Formador
import pt.atec.hawk_portal_app.model.LoginRequest
import pt.atec.hawk_portal_app.model.LoginResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {

    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    @GET("formadores")
    suspend fun getFormadores(): Response<List<Formador>>

}
