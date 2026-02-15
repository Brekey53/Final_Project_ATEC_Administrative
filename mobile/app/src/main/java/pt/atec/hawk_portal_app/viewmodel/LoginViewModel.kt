package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.gson.Gson
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.model.LoginRequest
import pt.atec.hawk_portal_app.states.LoginUiState
import kotlin.jvm.java


class LoginViewModel(application: Application)
    : AndroidViewModel(application){

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState
    private val api = RetrofitClient.create(application)


    fun login(email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, message = "")

            try {
                val response = api.login(
                    LoginRequest(email, password)
                )

                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isSuccess = true
                    )
                } else {
                    val errorBody = response.errorBody()?.string()

                    val errorMessage = try {
                        val parsed = Gson().fromJson(errorBody, uiState.value::class.java)
                        parsed.message
                    } catch (e: Exception) {
                        "Erro no login"
                    }

                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        message = errorMessage
                    )
                }


            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    message = "Erro de rede"
                )
            }
        }
    }
}
