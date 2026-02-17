package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.states.CursosUiState

/**
 * ViewModel responsável por gerir a obtenção e o estado
 * da lista de cursos da aplicação.
 *
 * Utiliza Retrofit para comunicar com a API
 * e expõe o estado da interface através de StateFlow,
 * seguindo o padrão de arquitetura MVVM.
 *
 * O estado é representado por CursosUiState,
 * permitindo à interface reagir automaticamente
 * a alterações como loading, sucesso ou erro.
 *
 * @param application Contexto da aplicação necessário
 * para inicialização do RetrofitClient.
 */
class CursosViewModel(application: Application)
    : AndroidViewModel(application){
    private val _uiState = MutableStateFlow(CursosUiState())
    val uiState: StateFlow<CursosUiState> = _uiState

    private val api = RetrofitClient.create(application)

    /**
     * Obtém a lista de cursos a partir da API.
     *
     * - Atualiza o estado para loading antes do pedido.
     * - Executa a chamada de forma assíncrona utilizando viewModelScope.
     * - Atualiza o estado com os dados recebidos em caso de sucesso.
     * - Define uma mensagem de erro caso a resposta falhe
     *   ou ocorra exceção de rede.
     *
     * As alterações são refletidas no uiState,
     * permitindo que a interface Compose seja automaticamente atualizada.
     */
    fun getCursos() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                loading = true,
                message = null
            )

            try {
                val response = api.getCursos()

                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        loading = false,
                        success = true,
                        cursos = response.body() ?: emptyList()
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