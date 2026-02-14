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


    /**
     * Atualiza o valor da data introduzida pelo utilizador.
     *
     * Caso o estado atual seja do tipo [DisponibilidadeSalasUiState.Ready],
     * cria uma nova cópia do estado com o campo `dataTexto` atualizado.
     *
     * Se o estado atual não for Ready, nenhuma alteração é efetuada.
     *
     * @param value Nova data introduzida pelo utilizador.
     */
    fun DataTextoAlterado(value: String) {
        atualizarReady { copy(dataTexto = value) }
    }

    /**
     * Atualiza o valor da hora de início introduzida pelo utilizador.
     *
     * Caso o estado atual seja do tipo [DisponibilidadeSalasUiState.Ready],
     * cria uma nova cópia do estado com o campo `horaInicioTexto` atualizado.
     *
     * Se o estado atual não for Ready, nenhuma alteração é efetuada.
     *
     * @param value Nova hora de início introduzida pelo utilizador.
     */
    fun HoraInicioTextoAlterado(value: String) {
        atualizarReady { copy(horaInicioTexto = value) }
    }

    /**
     * Atualiza o valor da hora de fim introduzida pelo utilizador.
     *
     * Caso o estado atual seja do tipo [DisponibilidadeSalasUiState.Ready],
     * cria uma nova cópia do estado com o campo `horaFimTexto` atualizado.
     *
     * Se o estado atual não for Ready, nenhuma alteração é efetuada.
     *
     * @param value Nova hora de fim introduzida pelo utilizador.
     */
    fun HoraFimTextoAlterado(value: String) {
        atualizarReady { copy(horaFimTexto = value) }
    }

    /**
     * Atualiza o estado atual caso este seja do tipo [DisponibilidadeSalasUiState.Ready].
     *
     * Recebe uma função que é executada sobre o estado Ready atual,
     * permitindo alterar apenas os campos necessários através de uma cópia.
     *
     * Caso o estado atual não seja do tipo Ready, nenhuma alteração é efetuada.
     *
     * @param update Função de extensão sobre [DisponibilidadeSalasUiState.Ready]
     *               que devolve uma nova instância modificada do estado.
     */
    private fun atualizarReady(
        update: DisponibilidadeSalasUiState.Ready.() -> DisponibilidadeSalasUiState.Ready
    ) {
        val estadoAtual = _uiState.value
        if (estadoAtual !is DisponibilidadeSalasUiState.Ready) return

        _uiState.value = estadoAtual.update()
    }

    /**
     * Verifica se os filtros de pesquisa são válidos.
     *
     * Esta é uma função de extensão sobre [DisponibilidadeSalasUiState.Ready],
     * permitindo validar diretamente os dados presentes no estado atual.
     *
     * Valida:
     * - Se a data está no formato correto.
     * - Se a hora de início é válida.
     * - Se a hora de fim é válida.
     * - Se a hora de início é anterior à hora de fim.
     *
     * @return true se todos os filtros forem válidos e coerentes,
     *         false caso contrário.
     */
    private fun DisponibilidadeSalasUiState.Ready.filtrosValidos(): Boolean {
        normalizarData(dataTexto) ?: return false
        val inicioApi = normalizarHora(horaInicioTexto) ?: return false
        val fimApi = normalizarHora(horaFimTexto) ?: return false

        return inicioApi < fimApi
    }

    /**
     * Carrega as salas disponíveis através da chamada à API.
     *
     * A função é executada de forma assíncrona dentro de uma coroutine associada
     * ao [viewModelScope].
     *
     * Fluxo de execução:
     * 1. Verifica se o estado atual é [DisponibilidadeSalasUiState.Ready].
     * 2. Valida e normaliza os filtros de data e hora.
     * 3. Atualiza o estado para indicar que o carregamento está em curso.
     * 4. Executa o pedido à API.
     * 5. Em caso de sucesso, atualiza a lista de salas e remove o estado de loading.
     * 6. Em caso de erro, altera o estado para [DisponibilidadeSalasUiState.Error].
     *
     * A função não executa nenhuma ação caso:
     * - O estado atual não seja do tipo Ready.
     * - Os filtros de data ou hora sejam inválidos.
     */
    private fun carregarSalas() {
        viewModelScope.launch {

            val estado = _uiState.value
            if (estado !is DisponibilidadeSalasUiState.Ready) {
                return@launch
            }

            val dataApi = normalizarData(estado.dataTexto)
            val inicioApi = normalizarHora(estado.horaInicioTexto)
            val fimApi = normalizarHora(estado.horaFimTexto)

            if (dataApi == null || inicioApi == null || fimApi == null) {
                return@launch
            }

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
                    loadingSalas = false
                )

            } catch (e: Exception) {

                _uiState.value = DisponibilidadeSalasUiState.Error(
                    e.message ?: "Erro"
                )
            }
        }
    }

    /**
     * Valida e normaliza uma data no formato ISO "yyyy-MM-dd".
     *
     * A função apenas verifica se a string corresponde ao padrão
     * numérico "AAAA-MM-DD" através de REGEX.
     *
     * @param input Data (formato String) introduzida pelo utilizador.
     * @return A própria string caso esteja no formato correto,
     *         ou null se não corresponder ao padrão esperado.
     */
    private fun normalizarData(input: String): String? {
        return if (Regex("""\d{4}-\d{2}-\d{2}""").matches(input)) {
            input
        } else {
            null
        }
    }

    /**
     * Valida e normaliza uma hora no formato "HH:mm".
     *
     * A função verifica:
     * - Se a string contém exatamente duas partes separadas por ":"
     * - Se hora e minuto são valores numéricos válidos
     * - Se a hora está no intervalo 0..23
     * - Se o minuto está no intervalo 0..59
     *
     * Caso seja válida, devolve a hora formatada com dois dígitos
     * para hora e minuto (ex: "9:5" torna-se "09:05").
     *
     * @param input Hora introduzida pelo utilizador.
     * @return Hora normalizada no formato "HH:mm",
     *         ou null se for inválida.
     */
    private fun normalizarHora(input: String): String? {
        val partes = input.split(":")
        if (partes.size != 2)
            return null

        val hora = partes[0].toIntOrNull() ?: return null
        val minuto = partes[1].toIntOrNull() ?: return null

        if (hora !in 0..23) return null
        if (minuto !in 0 until 60) return null

        return String.format("%02d:%02d", hora, minuto)
    }


    /**
     * Pesquisa as salas disponíveis.
     *
     * Verifica se o estado atual é [DisponibilidadeSalasUiState.Ready].
     * Caso não seja, a função não executa nenhuma ação.
     *
     * Valida também os filtros introduzidos pelo utilizador (data, horaInicio e horaFim).
     * Se os filtros forem inválidos, a pesquisa não é feita.
     *
     * Se passar as validações, inicia o carregamento das salas
     * através da função [carregarSalas], que executa a chamada à API.
     */
    fun onPesquisarClick() {
        val estadoAtual = _uiState.value
        if (estadoAtual !is DisponibilidadeSalasUiState.Ready)
            return

        if (!estadoAtual.filtrosValidos())
            return

        carregarSalas()
    }

    /**
     * Limpa os filtros da pesquisa e repõe o estado inicial do ecrã.
     *
     * Apenas executa a ação se o estado atual for [DisponibilidadeSalasUiState.Ready].
     * Caso contrário, não realiza nenhuma alteração.
     *
     * Define novamente o estado como uma nova instância de
     * [DisponibilidadeSalasUiState.Ready], removendo todos os filtros,
     * resultados de pesquisa e indicadores de loading.
     */
    fun onLimparPesquisaClick() {
        val estadoAtual = _uiState.value
        if (estadoAtual !is DisponibilidadeSalasUiState.Ready)
            return

        _uiState.value = DisponibilidadeSalasUiState.Ready()
    }

}
