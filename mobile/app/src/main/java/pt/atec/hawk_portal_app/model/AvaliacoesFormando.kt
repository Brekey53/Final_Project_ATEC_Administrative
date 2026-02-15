package pt.atec.hawk_portal_app.model

data class AvaliacoesFormando (
    val idAvaliacao: Int,
    val nomeModulo: String,
    val nota: Double?,
    val dataAvaliacao: String,
    val totalModulosCurso: Int
)