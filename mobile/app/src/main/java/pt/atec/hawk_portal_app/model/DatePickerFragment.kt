package pt.atec.hawk_portal_app.model

import android.app.DatePickerDialog
import android.app.Dialog
import android.icu.util.Calendar
import android.os.Bundle
import android.widget.DatePicker
import androidx.fragment.app.DialogFragment

/**
 * Fragment responsável por apresentar um DatePickerDialog
 * e devolver a data selecionada através de um callback.
 *
 * Este componente encapsula a lógica do field para selecionar datas
 *
 * @property onDateSelected Função callback executada quando o utilizador
 * seleciona uma data. Recebe ano, mês e dia como parâmetros.
 * Caso não seja fornecida, é utilizado um callback vazio
 */
class DatePickerFragment(
    val onDateSelected: (year: Int, month: Int, day: Int) -> Unit = { _, _, _ -> }
) : DialogFragment(), DatePickerDialog.OnDateSetListener {

    /**
     * Cria e devolve a instância do DatePickerDialog.
     *
     * A data inicial apresentada corresponde à data atual do sistema.
     *
     * @param savedInstanceState Estado previamente guardado do fragment
     *
     * @return Instância configurada de DatePickerDialog.
     */
    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val c = Calendar.getInstance()
        val year = c.get(Calendar.YEAR)
        val month = c.get(Calendar.MONTH)
        val day = c.get(Calendar.DAY_OF_MONTH)

        return DatePickerDialog(requireContext(), this, year, month, day)
    }

    /**
     * Callback executado automaticamente quando o utilizador
     * seleciona uma data no DatePicker.
     *
     * Encaminha os valores selecionados para o callback definido
     * na criação do fragment.
     *
     * @param view Instância do DatePicker.
     * @param year Ano selecionado.
     * @param month Mês selecionado
     * @param day Dia selecionado.
     */
    override fun onDateSet(view: DatePicker, year: Int, month: Int, day: Int) {
        onDateSelected(year, month, day)
    }
}
