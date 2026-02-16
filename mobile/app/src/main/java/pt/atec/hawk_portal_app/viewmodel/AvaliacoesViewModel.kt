package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.states.AvaliacoesUiState

/**
 * ViewModel responsável por gerir a lógica de obtenção
 * das avaliações do formando.
 *
 * Utiliza Retrofit para realizar pedidos à API
 * e expõe o estado da interface através de StateFlow.
 *
 * @param application Contexto da aplicação necessário
 * para inicialização do RetrofitClient.
 */
class AvaliacoesViewModel(
    application: Application
) : AndroidViewModel(application) {

    private val api = RetrofitClient.create(application)

    private val _uiState = MutableStateFlow(AvaliacoesUiState())
    val uiState: StateFlow<AvaliacoesUiState> = _uiState

    /**
     * Obtém a lista de avaliações do formando através da API.
     *
     * - Atualiza o estado para loading.
     * - Executa o pedido de forma assíncrona usando viewModelScope.
     * - Atualiza o estado com os dados recebidos em caso de sucesso.
     * - Define uma mensagem de erro caso a resposta falhe
     *   ou ocorra exceção de rede.
     *
     * O resultado é refletido no uiState,
     * permitindo à interface reagir automaticamente às alterações.
     */
    fun getAvaliacoes() {
        viewModelScope.launch {

            _uiState.value = AvaliacoesUiState(loading = true)

            try {
                val response = api.getAvaliacoesFormando()

                if (response.isSuccessful) {
                    _uiState.value = AvaliacoesUiState(
                        loading = false,
                        avaliacoes = response.body() ?: emptyList()
                    )
                } else {
                    _uiState.value = AvaliacoesUiState(
                        loading = false,
                        error = "Erro ao carregar avaliações"
                    )
                }

            } catch (e: Exception) {
                _uiState.value = AvaliacoesUiState(
                    loading = false,
                    error = "Erro de rede"
                )
            }
        }
    }
}