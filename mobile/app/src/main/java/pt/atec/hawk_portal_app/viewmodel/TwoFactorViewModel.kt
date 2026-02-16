package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.gson.Gson
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.model.Verify2FARequest
import pt.atec.hawk_portal_app.states.ApiError

/**
 * ViewModel responsável por gerir o processo de verificação
 * de autenticação em dois fatores (2FA).
 *
 * Expõe três estados principais através de StateFlow:
 * - isLoading: indica se o processo de verificação está em curso.
 * - error: mensagem de erro devolvida pela API ou gerada localmente.
 * - token: token JWT devolvido após verificação bem-sucedida.
 *
 * Utiliza Retrofit para comunicar com o backend
 * e Gson para interpretar mensagens de erro.
 *
 * @param application Contexto da aplicação necessário
 * para inicialização do RetrofitClient.
 */
class TwoFactorViewModel(application: Application)
    : AndroidViewModel(application){

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    private val _token = MutableStateFlow<String?>(null)
    val token: StateFlow<String?> = _token
    private val api = RetrofitClient.create(application)

    /**
     * Executa a verificação do código de autenticação em dois fatores.
     *
     * Fluxo de execução:
     * - Ativa o estado de loading.
     * - Envia o email e o código para a API.
     * - Em caso de sucesso, guarda o token devolvido pelo servidor.
     * - Caso o token seja inválido ou inexistente, define mensagem de erro.
     * - Em caso de erro na resposta, interpreta a mensagem devolvida pelo backend.
     * - Em caso de exceção (ex: falha de rede), define erro genérico.
     * - Desativa o estado de loading no final da operação.
     *
     * @param email Email associado à sessão de autenticação.
     * @param code Código de verificação introduzido pelo utilizador.
     */
    fun verifyCode(email: String, code: String) {
        viewModelScope.launch {
            val gson = Gson()
            _isLoading.value = true
            _error.value = null

            try {
                val response = api.verify2FA(
                    Verify2FARequest(email, code)
                )

                if (response.isSuccessful) {
                    _token.value = response.body()?.token

                    if (_token.value == null) {
                        _error.value = "Resposta inválida do servidor"
                    }
                } else {

                    val errorBody = response.errorBody()?.string()

                    // Necessário o Parse para gson devido à msg recebida do backend
                    _error.value = try {
                        gson.fromJson(errorBody, ApiError::class.java)?.message ?: "Código inválido"
                    } catch (e: Exception) {
                        "Código inválido"

                    }
                }
            } catch (e: Exception) {
                _error.value = "Erro de rede"
            } finally {
                _isLoading.value = false
            }
        }
    }

    /**
     * Limpa a mensagem de erro atual.
     *
     * Utilizado para remover mensagens antigas da interface
     * antes de nova tentativa de verificação.
     */
    fun clearError() {
        _error.value = null
    }
    /**
     * Limpa o token atualmente armazenado no estado.
     *
     * Utilizado após processamento do token
     * para evitar reutilização indevida.
     */
    fun clearToken() {
        _token.value = null
    }
}