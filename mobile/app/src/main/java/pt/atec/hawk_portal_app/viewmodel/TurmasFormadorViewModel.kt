package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.states.TurmasFormadorUiState

/**
 * ViewModel responsável por gerir a obtenção
 * das turmas atribuídas ao formador.
 *
 * Utiliza Retrofit para comunicar com o servidor
 * e expõe o estado da interface através de StateFlow,
 * permitindo que o Compose reaja automaticamente
 * a alterações como loading, sucesso ou erro.
 *
 * O estado é representado por TurmasFormadorUiState.
 *
 * @param application Contexto da aplicação necessário
 * para inicialização do RetrofitClient.
 */
class TurmasFormadorViewModel(application: Application)
    : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(TurmasFormadorUiState())
    val uiState: StateFlow<TurmasFormadorUiState> = _uiState

    private val api = RetrofitClient.create(application)

    /**
     * Obtém a lista de turmas atribuídas ao formador através da API.
     *
     * Fluxo de execução:
     * - Atualiza o estado para loading antes do pedido.
     * - Executa a chamada de forma assíncrona usando viewModelScope.
     * - Em caso de sucesso, atualiza a lista de turmas
     *   e define success como verdadeiro.
     * - Em caso de erro na resposta, define success como falso
     *   e apresenta o código de erro.
     * - Em caso de exceção (ex: falha de rede),
     *   define uma mensagem de erro genérica.
     */
    fun getTurmasFormador() {
        viewModelScope.launch {

            _uiState.value = _uiState.value.copy(
                loading = true,
                message = null
            )

            try {
                val response = api.getTurmasFormador()

                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        loading = false,
                        success = true,
                        turmas = response.body() ?: emptyList()
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        loading = false,
                        success = false,
                        message = "Erro: ${response.code()}"
                    )
                }

            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    loading = false,
                    success = false,
                    message = "Erro a ligar ao servidor"
                )
            }
        }
    }
}