package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.states.TurmasFormadorUiState

class TurmasFormadorViewModel(application: Application)
    : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(TurmasFormadorUiState())
    val uiState: StateFlow<TurmasFormadorUiState> = _uiState

    private val api = RetrofitClient.create(application)

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
