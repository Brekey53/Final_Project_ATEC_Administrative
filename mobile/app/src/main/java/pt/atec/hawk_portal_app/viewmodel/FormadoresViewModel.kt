package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.model.Formador

class FormadoresViewModel(application: Application)
    : AndroidViewModel(application){

    var formadores = mutableStateOf<List<Formador>>(emptyList())
        private set

    var isLoading = mutableStateOf(true)
        private set

    private val api = RetrofitClient.create(application)

    init {
        carregarFormadores()
    }

    private fun carregarFormadores() {
        viewModelScope.launch {
            try {
                val response = api.getFormadores()
                if (response.isSuccessful) {
                    formadores.value = response.body() ?: emptyList()
                }
            } catch (e: Exception) {
                // erro de rede
            } finally {
                isLoading.value = false
            }
        }
    }
}
