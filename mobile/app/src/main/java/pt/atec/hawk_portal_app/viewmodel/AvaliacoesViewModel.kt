package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.model.AvaliacoesFormando

data class AvaliacoesUiState(
    val loading: Boolean = false,
    val avaliacoes: List<AvaliacoesFormando> = emptyList(),
    val error: String? = null
)

class AvaliacoesViewModel(
    application: Application
) : AndroidViewModel(application) {

    private val api = RetrofitClient.create(application)

    private val _uiState = MutableStateFlow(AvaliacoesUiState())
    val uiState: StateFlow<AvaliacoesUiState> = _uiState

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
