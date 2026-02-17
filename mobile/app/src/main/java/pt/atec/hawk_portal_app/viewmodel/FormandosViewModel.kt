package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.model.Formando
import pt.atec.hawk_portal_app.states.FormandosUiState

/**
 * ViewModel responsável por gerir a obtenção
 * da lista de formandos.
 *
 * Utiliza StateFlow para expor o estado da interface,
 * seguindo o padrão arquitetural MVVM.
 *
 * @param application Contexto necessário para inicialização do RetrofitClient.
 */
class FormandosViewModel(application: Application)
    : AndroidViewModel(application){
    var formandos = mutableStateOf<List<Formando>>(emptyList())
        private set

    private val _uiState = MutableStateFlow(FormandosUiState())
    val uiState: StateFlow<FormandosUiState> = _uiState

    private val api = RetrofitClient.create(application)

    init {
        getFormandos()
    }

    /**
     * Obtém a lista de formandos através da API.
     *
     * Atualiza o estado para loading antes do pedido,
     * e posteriormente define sucesso ou erro.
     */
    fun getFormandos() {
        viewModelScope.launch {

            _uiState.value = _uiState.value.copy(
                loading = true,
                error = null
            )
            try {
                val response = api.getFormandos()

                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        loading = false,
                        formandos = response.body() ?: emptyList()
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        loading = false,
                        error = "Erro ao carregar formandos"
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