package pt.atec.hawk_portal_app.model

/**
 * Representa um curso disponível
 *
 * Contém informação do curso e da respetiva área, detalhe de curso
 */
data class Cursos(
    val idCursos: Int,
    val idArea: Int,
    val nome: String,
    val nomeArea: String,
)
