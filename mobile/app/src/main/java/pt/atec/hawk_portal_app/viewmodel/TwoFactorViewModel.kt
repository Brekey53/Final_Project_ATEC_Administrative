package pt.atec.hawk_portal_app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.model.Verify2FARequest

class TwoFactorViewModel : ViewModel() {

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    private val _token = MutableStateFlow<String?>(null)
    val token: StateFlow<String?> = _token

    fun verifyCode(email: String, code: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            try {
                val response = RetrofitClient.api.verify2FA(
                    Verify2FARequest(email, code)
                )

                if (response.isSuccessful) {
                    _token.value = response.body()?.token
                    if (_token.value == null) {
                        _error.value = "Resposta inválida do servidor"
                    }
                } else {
                    _error.value = response.errorBody()?.string()
                        ?: "Código inválido"
                }

            } catch (e: Exception) {
                _error.value = "Erro de rede"
            } finally {
                _isLoading.value = false
            }
        }
    }
}
