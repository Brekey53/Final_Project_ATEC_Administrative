package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.states.AvaliacoesUiState

class AvaliacoesViewModel(application: Application)
    : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(AvaliacoesUiState())
    val uiState: StateFlow<AvaliacoesUiState> = _uiState

    private val api = RetrofitClient.create(application)

    fun getAvaliacoes() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                loading = true,
                message = null
            )

            try {
                val response = api.getAvaliacoes()

                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        loading = false,
                        success = true,
                        avaliacoes = response.body() ?: emptyList()
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

