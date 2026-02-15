package pt.atec.hawk_portal_app.model

/**
 * Representa o detalhe de uma avaliação associada a um formando
 * dentro de um determinado módulo.
 */
data class AvaliacoesFormando (
    val idAvaliacao: Int,
    val nomeModulo: String,
    val nota: Double?,
    val dataAvaliacao: String,
    val totalModulosCurso: Int
)