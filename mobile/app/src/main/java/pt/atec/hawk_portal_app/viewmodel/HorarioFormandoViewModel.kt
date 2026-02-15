package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.model.HorarioFormando

class HorarioFormandoViewModel(application: Application)
    : AndroidViewModel(application) {

    private val api = RetrofitClient.create(application)

    private val _horarios = MutableStateFlow<List<HorarioFormando>>(emptyList())
    val horarios: StateFlow<List<HorarioFormando>> = _horarios

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    fun loadHorario() {
        viewModelScope.launch {
            _loading.value = true
            try {
                val response = api.getHorarioFormando()
                if (response.isSuccessful) {
                    _horarios.value = response.body() ?: emptyList()
                }
            } catch (e: Exception) {
                _horarios.value = emptyList()
            } finally {
                _loading.value = false
            }
        }
    }
}
