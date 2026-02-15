package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.model.Formando

class FormandosViewModel(application: Application)
    : AndroidViewModel(application){
    var formandos = mutableStateOf<List<Formando>>(emptyList())
        private set

    var isLoading = mutableStateOf(true)
        private set

    private val api = RetrofitClient.create(application)

    init {
        carregarFormandos()
    }

    private fun carregarFormandos() {
        viewModelScope.launch {
            try {
                val response = api.getFormandos()
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