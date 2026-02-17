package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.model.HorarioFormando

/**
 * ViewModel responsável por gerir a obtenção
 * do horário semanal do formando.
 *
 * Utiliza Retrofit para comunicar com a API
 * e expõe os dados através de StateFlow,
 * permitindo que a interface Compose reaja
 * automaticamente às alterações.
 *
 * Expõe dois estados principais:
 * - Lista de horários da semana.
 * - Loading inicial
 *
 * @param application Contexto da aplicação necessário
 * para inicialização do RetrofitClient.
 */
class HorarioFormandoViewModel(application: Application)
    : AndroidViewModel(application) {

    private val api = RetrofitClient.create(application)

    private val _horarios = MutableStateFlow<List<HorarioFormando>>(emptyList())
    val horarios: StateFlow<List<HorarioFormando>> = _horarios

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    /**
     * Obtém o horário semanal do formando através da API.
     *
     * - Ativa o estado de loading antes do pedido.
     * - Executa a chamada de forma assíncrona utilizando viewModelScope.
     * - Atualiza a lista de horários em caso de sucesso.
     * - Em caso de erro, define a lista como vazia.
     * - Desativa o estado de loading no final da operação.
     */
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