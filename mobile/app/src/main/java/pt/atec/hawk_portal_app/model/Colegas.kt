package pt.atec.hawk_portal_app.model

/**
 * data class para colegas de um determinado formando para o ecrã
 * TurmasFormandoScren
 *
 * Esta data class é utilizada para guardar informação básica
 * de identificação e contacto para visualização de colegas.
 */
data class Colegas(
    val id: Int,
    val nome: String,
    val email: String
)
