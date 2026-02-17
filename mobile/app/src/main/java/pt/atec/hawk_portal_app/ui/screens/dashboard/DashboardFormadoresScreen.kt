package pt.atec.hawk_portal_app.ui.screens.dashboard

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import pt.atec.hawk_portal_app.model.HorarioFormador
import pt.atec.hawk_portal_app.ui.components.AppMenuHamburger
import pt.atec.hawk_portal_app.utils.formatarData
import pt.atec.hawk_portal_app.viewmodel.HorarioFormadorViewModel

/**
 * Composable responsável por apresentar o Dashboard do Formador.
 *
 * Integra o componente AppMenuHamburger para navegação lateral
 * e apresenta a secção do horário semanal do formador.
 *
 * A anotação @RequiresApi(Build.VERSION_CODES.O) é necessária
 * porque o ecrã depende de funcionalidades da API 26 (Android 8.0)
 * ou superior, nomeadamente operações relacionadas com datas
 * e horas da biblioteca java.time.
 *
 * @param onDashboard Ação de navegação para o Dashboard.
 * @param onCursos Ação de navegação para Cursos.
 * @param onTurmas Ação de navegação para Turmas.
 * @param onSalas Ação de navegação para Salas.
 * @param onLogout Ação executada ao efetuar logout.
 */
@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun DashboardFormadoresScreen(
    onDashboard: () -> Unit,
    onCursos: (() -> Unit)?,
    onTurmas: () -> Unit,
    onSalas: () -> Unit,
    onLogout: () -> Unit
) {
    AppMenuHamburger(
        title = "Dashboard Formador",
        onDashboard = onDashboard,
        onCursos = onCursos,
        onTurmas = onTurmas,
        onSalas = onSalas,
        onLogout = onLogout
    ) {
        HorarioFormadorSection()
    }

}

/**
 * Composable responsável por carregar e apresentar o horário
 * semanal do formador.
 *
 * Obtém os dados através do HorarioFormadorViewModel,
 * gere o estado de carregamento e organiza as aulas
 * agrupadas por data.
 *
 * Requer API 26 ou superior devido à utilização de
 * funcionalidades modernas de manipulação de datas.
 *
 * @param viewModel ViewModel responsável por fornecer os dados do horário.
 */
@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun HorarioFormadorSection(
    viewModel: HorarioFormadorViewModel = viewModel()
) {
    val horarios by viewModel.horarios.collectAsState()
    val loading by viewModel.loading.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadHorarioSemana()
    }

    if (loading) {
        Box(
            modifier = Modifier
                .fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = Color.White)
        }
        return
    }

    if (horarios.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Sem aulas esta semana.",
                color = Color.White
            )
        }
        return
    }

    // esta variável vai agrupar uma lista de objetos com base no critério data e assim
    // demonstrar as aulas agrupadas por dia
    val groupedByDate = horarios.groupBy { it.data }

    androidx.compose.foundation.lazy.LazyColumn(
        modifier = Modifier
            .fillMaxSize(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp)
    ) {

        item {
            Text(
                text = "Horário da Semana",
                style = MaterialTheme.typography.headlineMedium,
                color = Color.White,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(16.dp))
        }

        groupedByDate.forEach { (data, aulasDoDia) ->

            item {
                Text(
                    text = formatarData(data),
                    color = Color.White,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(8.dp))
            }

            items(
                aulasDoDia.sortedBy { it.horaInicio }
            ) { aula ->
                AulaFormadorCard(aula)
                Spacer(modifier = Modifier.height(12.dp))
            }

            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

/**
 * Composable que representa um cartão individual de aula
 * no horário do formador.
 *
 * Apresenta informação sobre o módulo, turma, horário
 * e sala correspondente.
 *
 * @param aula Objeto contendo os dados da aula.
 */
@Composable
fun AulaFormadorCard(aula: HorarioFormador) {

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {

            Text(
                text = aula.nomeModulo,
                style = MaterialTheme.typography.titleMedium,
                color = Color(0xFF014D4E),
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Turma: ${aula.nomeTurma}",
                style = MaterialTheme.typography.bodyMedium
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "${aula.horaInicio} - ${aula.horaFim}",
                style = MaterialTheme.typography.bodyMedium
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "Sala: ${aula.nomeSala}",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}