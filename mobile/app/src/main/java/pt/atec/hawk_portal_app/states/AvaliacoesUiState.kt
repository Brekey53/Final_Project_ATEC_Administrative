package pt.atec.hawk_portal_app.states

import pt.atec.hawk_portal_app.model.AvaliacoesFormando

/**
 * Classe que representa o estado da interface do ecrã de avaliações.
 *
 * Contém:
 * - Indicador de loading.
 * - Lista de avaliações do formando.
 * - Mensagem de erro caso ocorra falha na obtenção dos dados.
 *
 * É utilizada pelo AvaliacoesViewModel para expor o estado
 * à interface através de StateFlow.
 *
 * @property loading Indica se os dados estão a ser carregados.
 * @property avaliacoes Lista de avaliações obtidas da API.
 * @property error Mensagem de erro caso a operação falhe.
 */
data class AvaliacoesUiState(
    val loading: Boolean = false,
    val avaliacoes: List<AvaliacoesFormando> = emptyList(),
    val error: String? = null
)