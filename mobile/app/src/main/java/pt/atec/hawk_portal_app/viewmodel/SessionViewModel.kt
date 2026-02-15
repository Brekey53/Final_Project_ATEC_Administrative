package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.dataStore.TokenDataStore
import pt.atec.hawk_portal_app.utils.JwtUtils

class SessionViewModel(application: Application)
    : AndroidViewModel(application) {

    private val _tipoUtilizador = MutableStateFlow<Int?>(null)
    val tipoUtilizador: StateFlow<Int?> = _tipoUtilizador

    init {
        viewModelScope.launch {
            val token = TokenDataStore.getTokenOnce(getApplication())
            _tipoUtilizador.value =
                token?.let { JwtUtils.getTipoUtilizador(it) }
        }
    }
}
