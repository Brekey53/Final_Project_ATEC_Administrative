package pt.atec.hawk_portal_app.api

import pt.atec.hawk_portal_app.model.Formador
import pt.atec.hawk_portal_app.model.LoginRequest
import pt.atec.hawk_portal_app.model.LoginResponse
import pt.atec.hawk_portal_app.model.Verify2FARequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {

    /**
     * Autentica um utilizador e devolve os dados de sessão.
     *
     * @param request Dados de login (email e password)
     * @return Response com o LoginResponse ou erro HTTP
     */
    @POST("auth/login")
    fun login(
        @Body request: LoginRequest): Response<LoginResponse>

    /**
     * Obtém a lista de formadores e fotografia.
     *
     * @return Response com a lista de formadores
     */
    @GET("formadores/com-foto")
    fun getFormadores(): Response<List<Formador>>

    /**
     * Valida o código de 6 dígitos enviado por e-mail.
     * FALTA VALIDAR O CODIGO LOL
     */
    @POST("auth/verify-2fa")
    fun verify2FA(
        @Body request: Verify2FARequest): Response<LoginResponse>
}

