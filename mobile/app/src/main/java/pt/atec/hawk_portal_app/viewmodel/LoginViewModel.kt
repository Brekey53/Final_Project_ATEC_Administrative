package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.gson.Gson
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.model.LoginRequest
import pt.atec.hawk_portal_app.states.LoginUiState
import kotlin.jvm.java

/**
 * ViewModel responsável por gerir o processo de autenticação
 * do utilizador.
 *
 *
 * Utiliza Retrofit para comunicar com a API e expõe o estado
 * da interface através de StateFlow, permitindo que o Compose
 * reaja automaticamente a alterações como loading, sucesso ou erro.
 *
 * O estado é representado por LoginUiState.
 *
 * @param application Contexto da aplicação necessário
 * para inicialização do RetrofitClient.
 */
class LoginViewModel(application: Application)
    : AndroidViewModel(application){

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState
    private val api = RetrofitClient.create(application)

    /**
     * Executa o processo de autenticação do utilizador.
     *
     * Fluxo de execução:
     * - Atualiza o estado para loading.
     * - Envia as credenciais (email e password) para a API.
     * - Em caso de sucesso, define o estado como isSuccess = true. E encaminha para 2FA
     * - Em caso de erro, tenta extrair a mensagem de erro devolvida pela API.
     * - Em caso de exceção (ex: falha de rede), define mensagem de erro genérica.
     *
     * @param email Email introduzido pelo utilizador.
     * @param password Palavra-passe introduzida pelo utilizador.
     */
    fun login(email: String, password: String) {
        viewModelScope.launch {
            if (email.isBlank() || password.isBlank()) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    message = "Preencha todos os campos"
                )
                return@launch
            }
            _uiState.value = _uiState.value.copy(isLoading = true, message = "")

            try {
                val response = api.login(
                    LoginRequest(email, password)
                )

                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isSuccess = true
                    )
                } else {
                    val errorBody = response.errorBody()?.string()

                    // foi necessário o Gson parsed porque a mensagem vinha do backend como
                    // json e mostrava no ecrã como um objeto
                    val errorMessage = try {
                        val parsed = Gson().fromJson(errorBody, uiState.value::class.java)
                        parsed.message
                    } catch (e: Exception) {
                        "Erro no login"
                    }

                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        message = errorMessage
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    message = "Erro de rede"
                )
            }
        }
    }
}