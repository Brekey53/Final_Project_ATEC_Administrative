package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.model.Formador
import pt.atec.hawk_portal_app.states.FormadoresUiState

/**
 * ViewModel responsável por gerir a obtenção
 * da lista de formadores da aplicação.
 *
 * Executa automaticamente o carregamento dos dados
 * no momento da sua inicialização.
 *
 * Utiliza Retrofit para comunicar com a API
 * e expõe o estado à interface através de mutableStateOf,
 * permitindo que o Compose reaja automaticamente
 * a alterações na lista ou no estado de loading.
 *
 * @param application Contexto da aplicação necessário
 * para inicialização do RetrofitClient.
 */
class FormadoresViewModel(application: Application)
    : AndroidViewModel(application){

    var formadores = mutableStateOf<List<Formador>>(emptyList())
        private set

    private val api = RetrofitClient.create(application)

    private val _uiState = MutableStateFlow(FormadoresUiState())
    val uiState: StateFlow<FormadoresUiState> = _uiState

    init {
        getFormadores()
    }

    /**
     * Obtém a lista de formadores através da API.
     *
     * Atualiza o estado para loading antes do pedido,
     * e posteriormente define sucesso ou erro.
     */
    fun getFormadores() {
        viewModelScope.launch {

            _uiState.value = _uiState.value.copy(
                loading = true,
                error = null
            )

            try {
                val response = api.getFormadores()

                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        loading = false,
                        formadores = response.body() ?: emptyList()
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        loading = false,
                        error = "Erro ao carregar formadores"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    loading = false,
                    error = "Erro de rede"
                )
            }
        }
    }
}
