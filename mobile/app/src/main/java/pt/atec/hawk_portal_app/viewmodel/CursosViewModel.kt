package pt.atec.hawk_portal_app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.states.CursosUiState

class CursosViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(CursosUiState())
    val uiState: StateFlow<CursosUiState> = _uiState

    fun getCursos() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                loading = true,
                message = null
            )

            try {
                val response = RetrofitClient.api.getCursos()

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
