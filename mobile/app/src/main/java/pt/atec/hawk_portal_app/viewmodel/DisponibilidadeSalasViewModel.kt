package pt.atec.hawk_portal_app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient.api
import pt.atec.hawk_portal_app.states.DisponibilidadeSalasUiState

class DisponibilidadeSalasViewModel : ViewModel() {

    private val _uiState =
        MutableStateFlow<DisponibilidadeSalasUiState>(
            DisponibilidadeSalasUiState.Ready()
        )

    val uiState = _uiState.asStateFlow()

    fun onDataTextoAlterado(value: String) {
        atualizarReady { copy(dataTexto = value) }
    }

    fun onHoraInicioTextoAlterado(value: String) {
        atualizarReady { copy(horaInicioTexto = value) }
    }

    fun onHoraFimTextoAlterado(value: String) {
        atualizarReady { copy(horaFimTexto = value) }
    }

    private fun atualizarReady(
        update: DisponibilidadeSalasUiState.Ready.() -> DisponibilidadeSalasUiState.Ready
    ) {
        val estadoAtual = _uiState.value
        if (estadoAtual !is DisponibilidadeSalasUiState.Ready) return

        _uiState.value = estadoAtual.update()
    }

    private fun DisponibilidadeSalasUiState.Ready.filtrosValidos(): Boolean {
        normalizarData(dataTexto) ?: return false
        val inicioApi = normalizarHora(horaInicioTexto) ?: return false
        val fimApi = normalizarHora(horaFimTexto) ?: return false

        return inicioApi < fimApi
    }


    private fun carregarSalas() {
        viewModelScope.launch {
            val estadoAtual = _uiState.value
            if (estadoAtual !is DisponibilidadeSalasUiState.Ready) return@launch

            val dataApi = normalizarData(estadoAtual.dataTexto) ?: return@launch
            val inicioApi = normalizarHora(estadoAtual.horaInicioTexto) ?: return@launch
            val fimApi = normalizarHora(estadoAtual.horaFimTexto) ?: return@launch

            _uiState.value = estadoAtual.copy(loadingSalas = true, pesquisaFeita = true)

            try {
                val response = api.getSalasDisponiveis(
                    data = dataApi,
                    inicio = inicioApi,
                    fim = fimApi,
                    idCursoModulo = null
                )

                _uiState.value = estadoAtual.copy(
                    salas = response.body() ?: emptyList(),
                    loadingSalas = false
                )
            } catch (e: Exception) {
                e.printStackTrace()

                _uiState.value =
                    DisponibilidadeSalasUiState.Error(
                        e.message ?: "Erro desconhecido"
                    )
            }
        }
    }

    private fun normalizarData(input: String): String? {
        return if (Regex("""\d{4}-\d{2}-\d{2}""").matches(input)) {
            input
        } else {
            null
        }
    }

    private fun normalizarHora(input: String): String? {
        val partes = input.split(":")
        if (partes.size != 2) return null

        val hora = partes[0].padStart(2, '0')
        val minuto = partes[1].padStart(2, '0')

        return "$hora:$minuto"
    }

    fun onPesquisarClick() {
        val estadoAtual = _uiState.value
        if (estadoAtual !is DisponibilidadeSalasUiState.Ready) return

        if (!estadoAtual.filtrosValidos()) return

        carregarSalas()
    }


    fun onLimparPesquisaClick() {
        val estadoAtual = _uiState.value
        if (estadoAtual !is DisponibilidadeSalasUiState.Ready) return

        _uiState.value = DisponibilidadeSalasUiState.Ready()
    }

}
