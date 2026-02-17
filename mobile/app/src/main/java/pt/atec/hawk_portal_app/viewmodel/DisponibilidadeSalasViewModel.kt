package pt.atec.hawk_portal_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import pt.atec.hawk_portal_app.api.RetrofitClient
import pt.atec.hawk_portal_app.states.DisponibilidadeSalasUiState

/**
 * ViewModel responsável por gerir a lógica de pesquisa
 * de disponibilidade de salas.
 *
 * Responsabilidades:
 * - Gerir o estado do ecrã através de StateFlow.
 * - Controlar os filtros introduzidos pelo utilizador
 *   (data, hora de início e hora de fim).
 * - Validar e normalizar os valores antes de enviar para a API.
 * - Executar a chamada assíncrona à API para obter salas disponíveis.
 * - Atualizar o estado para loading, sucesso ou erro.
 *
 * O estado é representado por DisponibilidadeSalasUiState,
 * podendo assumir diferentes tipos (Ready ou Error).
 *
 * @param application Contexto da aplicação necessário
 * para inicialização do RetrofitClient.
 */
class DisponibilidadeSalasViewModel(application: Application)
    : AndroidViewModel(application) {

    private val _uiState =
        MutableStateFlow<DisponibilidadeSalasUiState>(
            DisponibilidadeSalasUiState.Ready()
        )

    val uiState = _uiState.asStateFlow()

    private val api = RetrofitClient.create(application)

    /**
     * Atualiza o valor da data introduzida pelo utilizador.
     * Limpa eventuais mensagens de erro de validação.
     */
    fun DataTextoAlterado(value: String) {
        atualizarReady { copy(dataTexto = value, erroValidacao = null) }
    }

    /**
     * Atualiza o valor da hora de início introduzida pelo utilizador.
     * Limpa eventuais mensagens de erro de validação.
     */
    fun HoraInicioTextoAlterado(value: String) {
        atualizarReady { copy(horaInicioTexto = value, erroValidacao = null) }
    }

    /**
     * Atualiza o valor da hora de fim introduzida pelo utilizador.
     * Limpa eventuais mensagens de erro de validação.
     */
    fun HoraFimTextoAlterado(value: String) {
        atualizarReady { copy(horaFimTexto = value, erroValidacao = null) }
    }

    /**
     * Atualiza o estado atual caso este seja do tipo Ready.
     */
    private fun atualizarReady(
        update: DisponibilidadeSalasUiState.Ready.() -> DisponibilidadeSalasUiState.Ready
    ) {
        val estadoAtual = _uiState.value
        if (estadoAtual !is DisponibilidadeSalasUiState.Ready) return
        _uiState.value = estadoAtual.update()
    }

    /**
     * Pesquisa as salas disponíveis.
     *
     * Verifica se:
     * - Todos os campos estão preenchidos.
     * - Data está no formato correto.
     * - Horas são válidas.
     * - Hora de fim é superior à hora de início.
     *
     * Apenas executa a chamada à API se todas as validações forem bem-sucedidas.
     */
    fun onPesquisarClick() {
        val estadoAtual = _uiState.value
        if (estadoAtual !is DisponibilidadeSalasUiState.Ready)
            return

        val erro = estadoAtual.validarFiltros()

        if (erro != null) {
            _uiState.value = estadoAtual.copy(
                erroValidacao = erro
            )
            return
        }

        _uiState.value = estadoAtual.copy(
            erroValidacao = null
        )

        carregarSalas()
    }

    /**
     * Limpa os filtros da pesquisa e repõe o estado inicial do ecrã.
     */
    fun onLimparPesquisaClick() {
        val estadoAtual = _uiState.value
        if (estadoAtual !is DisponibilidadeSalasUiState.Ready)
            return

        _uiState.value = DisponibilidadeSalasUiState.Ready()
    }

    /**
     * Executa a chamada à API para obter salas disponíveis.
     */
    private fun carregarSalas() {
        viewModelScope.launch {

            val estado = _uiState.value
            if (estado !is DisponibilidadeSalasUiState.Ready)
                return@launch

            val dataApi = normalizarData(estado.dataTexto) ?: return@launch
            val inicioApi = normalizarHora(estado.horaInicioTexto) ?: return@launch
            val fimApi = normalizarHora(estado.horaFimTexto) ?: return@launch

            _uiState.value = estado.copy(
                loadingSalas = true,
                pesquisaFeita = true
            )

            try {
                val response = api.getSalasDisponiveis(
                    data = dataApi,
                    inicio = inicioApi,
                    fim = fimApi,
                    idCursoModulo = null
                )

                val salas = response.body() ?: emptyList()

                _uiState.value = estado.copy(
                    salas = salas,
                    loadingSalas = false,
                    pesquisaFeita = true
                )

            } catch (e: Exception) {
                _uiState.value = DisponibilidadeSalasUiState.Error(
                    e.message ?: "Erro"
                )
            }
        }
    }

    /**
     * Valida os filtros introduzidos pelo utilizador.
     *
     * @return Mensagem de erro caso exista problema,
     *         ou null se estiver tudo válido.
     */
    private fun DisponibilidadeSalasUiState.Ready.validarFiltros(): String? {

        if (dataTexto.isBlank() ||
            horaInicioTexto.isBlank() ||
            horaFimTexto.isBlank()
        ) {
            return "Preencha todos os campos"
        }

        if (normalizarData(dataTexto) == null) {
            return "Formato de data inválido (yyyy-MM-dd)"
        }

        val inicio = normalizarHora(horaInicioTexto)
            ?: return "Hora de início inválida"

        val fim = normalizarHora(horaFimTexto)
            ?: return "Hora de fim inválida"

        if (inicio >= fim) {
            return "A hora de fim deve ser superior à hora de início"
        }

        return null
    }

    /**
     * Valida formato da data.
     */
    private fun normalizarData(input: String): String? {
        return if (Regex("""\d{4}-\d{2}-\d{2}""").matches(input)) {
            input
        } else null
    }

    /**
     * Valida e normaliza hora no formato HH:mm.
     */
    private fun normalizarHora(input: String): String? {
        val partes = input.split(":")
        if (partes.size != 2) return null

        val hora = partes[0].toIntOrNull() ?: return null
        val minuto = partes[1].toIntOrNull() ?: return null

        if (hora !in 0..23) return null
        if (minuto !in 0 until 60) return null

        return String.format("%02d:%02d", hora, minuto)
    }
}