package pt.atec.hawk_portal_app.utils

import android.os.Build
import androidx.annotation.RequiresApi

/**
 * Função responsável por converter uma data no formato ISO (yyyy-MM-dd)
 * para um formato mais legível.
 *
 * Utiliza a classe LocalDate da biblioteca java.time para
 * efetuar o parsing e formatação da data.
 *
 * Caso ocorra algum erro no parsing, devolve a string original.
 *
 * Requer API 26 ou superior devido à utilização de LocalDate.
 *
 * @param data Data em formato String.
 * @return Data formatada em formato legível.
 */
@RequiresApi(Build.VERSION_CODES.O)
fun formatarData(data: String): String {
    return try {
        val parsed = java.time.LocalDate.parse(data)
        parsed.dayOfMonth.toString() + " " +
                parsed.month.name.lowercase()
                    .replaceFirstChar { it.uppercase() } +
                " " +
                parsed.year
    } catch (e: Exception) {
        data
    }
}