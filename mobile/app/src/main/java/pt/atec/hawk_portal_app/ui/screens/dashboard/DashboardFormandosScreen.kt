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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
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
import pt.atec.hawk_portal_app.model.HorarioFormando
import pt.atec.hawk_portal_app.ui.components.AppMenuHamburger
import pt.atec.hawk_portal_app.viewmodel.HorarioFormandoViewModel

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun DashboardFormandosScreen(
    onDashboard: () -> Unit,
    onCursos: () -> Unit,
    onAvaliacoes: () -> Unit,
    onTurmas: () -> Unit = {},
    onLogout: () -> Unit
) {

    AppMenuHamburger(
        title = "Dashboard Formando",
        onDashboard = onDashboard,
        onCursos = onCursos,
        onAvaliacoes = onAvaliacoes,
        onTurmas = onTurmas,
        onLogout = onLogout
    ) {

        Scaffold(
            containerColor = Color(0xFF014D4E)
        ) { paddingValues ->

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {

                HorarioFormandoSection()
            }
        }
    }
}

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun HorarioFormandoSection(
    viewModel: HorarioFormandoViewModel = viewModel()
) {
    val horarios by viewModel.horarios.collectAsState()
    val loading by viewModel.loading.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadHorario()
    }

    if (loading) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = Color.White)
        }
        return
    }

    if (horarios.isEmpty()) {
        Text(
            text = "Sem aulas agendadas.",
            color = Color.White,
            modifier = Modifier.padding(16.dp)
        )
        return
    }

    val groupedByDate = horarios.groupBy { it.data }

    LazyColumn(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
    ) {

        item {
            Text(
                text = "Horário",
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

            items(aulasDoDia.sortedBy { it.horaInicio }) { aula ->
                AulaCard(aula)
                Spacer(modifier = Modifier.height(12.dp))
            }

            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
fun AulaCard(aula: HorarioFormando) {

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {

            Text(
                text = aula.nomeModulo,
                style = MaterialTheme.typography.titleMedium,
                color = Color(0xFF014D4E),
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(6.dp))

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