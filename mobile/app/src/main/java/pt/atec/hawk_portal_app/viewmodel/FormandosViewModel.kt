package pt.atec.hawk_portal_app.viewmodel

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.model.Formando

class FormandosViewModel : ViewModel() {
    var formandos = mutableStateOf<List<Formando>>(emptyList())
        private set

    var isLoading = mutableStateOf(true)
        private set

    init {
        carregarFormandos()
    }

    private fun carregarFormandos() {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.api.getFormandos()
                if (response.isSuccessful) {
                    formandos.value = response.body() ?: emptyList()
                }
            } catch (e: Exception) {
                // erro de rede
            } finally {
                isLoading.value = false
            }
        }
    }
}