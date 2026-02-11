package pt.atec.hawk_portal_app.api

import pt.atec.hawk_portal_app.model.Cursos
import pt.atec.hawk_portal_app.model.DisponibilidadeSalas
import pt.atec.hawk_portal_app.model.Formador
import pt.atec.hawk_portal_app.model.Formando
import pt.atec.hawk_portal_app.model.LoginRequest
import pt.atec.hawk_portal_app.model.LoginResponse
import pt.atec.hawk_portal_app.model.Verify2FARequest
import pt.atec.hawk_portal_app.model.Verify2FAResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

interface ApiService {


    /**
     * Obtém a lista de formadores e fotografia.
     *
     * @return Response com a lista de formadores
     */
    @GET("formadores/com-foto")
    suspend fun getFormadores(): Response<List<Formador>>

    /**
     * Obtém a lista de formandos e fotografia.
     *
     * @return Response com a lista de formandos
     */
    @GET("formandos/com-foto")
    suspend fun getFormandos(): Response<List<Formando>>


    /**
     * GET às salas disponiveis
     */
    @GET("salas/disponiveis")
    suspend fun getSalasDisponiveis(
        @Query("data") data: String,
        @Query("inicio") inicio: String,
        @Query("fim") fim: String,
        @Query("idCursoModulo") idCursoModulo: Int?
    ): Response<List<DisponibilidadeSalas>>

    /**
     * Obtém a lista de cursos
     *
     * @return Response com a lista de cursos
     */
    @GET("cursos")
    suspend fun getCursos(): Response<List<Cursos>>

    /**
     * Autentica um utilizador e devolve os dados de sessão.
     *
     * @param request Dados de login (email e password)
     * @return Response com o LoginResponse ou erro HTTP
     */
    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    /**
     * Valida o código de 6 dígitos enviado por e-mail.
     */
    @POST("auth/verify-2fa")
    suspend fun verify2FA(
        @Body request: Verify2FARequest
    ): Response<Verify2FAResponse>
}

