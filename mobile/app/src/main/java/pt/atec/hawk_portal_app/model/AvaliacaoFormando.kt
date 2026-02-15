package pt.atec.hawk_portal_app.model

/**
 * Representa a avaliação atribuída a um formando no
 * TurmasFormandoScreen.
 *
 * Esta data class é utilizada para reencaminhar informação
 * relacionada com a nota obtida e a respetiva data de avaliação
 */
data class AvaliacaoFormando(
    val nota: Double?,
    val data: String?
)
