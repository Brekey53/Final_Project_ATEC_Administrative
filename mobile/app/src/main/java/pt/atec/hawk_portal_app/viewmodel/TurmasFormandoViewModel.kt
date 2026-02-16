package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.states.TurmasFormandoUiState

/**
 * ViewModel responsável por gerir a obtenção
 * da turma associada ao formando autenticado.
 *
 * Utiliza Retrofit para comunicar com o servidor
 * e expõe o estado da interface através de StateFlow,
 * permitindo que o Compose reaja automaticamente
 * a alterações como loading, sucesso ou erro.
 *
 * O estado é representado por TurmasFormandoUiState.
 *
 * @param application Contexto da aplicação necessário
 * para inicialização do RetrofitClient.
 */
class TurmasFormandoViewModel(application: Application)
    : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(TurmasFormandoUiState())
    val uiState: StateFlow<TurmasFormandoUiState> = _uiState

    private val api = RetrofitClient.create(application)

    /**
     * Obtém os dados da turma do formando através da API.
     *
     * Fluxo de execução:
     * - Atualiza o estado para loading antes do pedido.
     * - Executa a chamada de forma assíncrona usando viewModelScope.
     * - Em caso de sucesso, atualiza os dados da turma
     *   e define success como verdadeiro.
     * - Em caso de erro na resposta, define success como falso
     *   e apresenta o código de erro.
     * - Em caso de exceção (ex: falha de rede),
     *   define uma mensagem de erro genérica.
     *
     * O resultado é refletido no uiState,
     * permitindo atualização automática da interface.
     */
    fun getMinhaTurma() {
        viewModelScope.launch {

            _uiState.value = _uiState.value.copy(
                loading = true,
                message = null
            )

            try {
                val response = api.getMinhaTurma()
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        loading = false,
                        success = true,
                        turma = response.body()
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
