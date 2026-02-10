package pt.atec.hawk_portal_app.viewmodel

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.model.Formador

class FormadoresViewModel : ViewModel() {

    var formadores = mutableStateOf<List<Formador>>(emptyList())
        private set

    var isLoading = mutableStateOf(true)
        private set

    init {
        carregarFormadores()
    }

    private fun carregarFormadores() {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.api.getFormadores()
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
