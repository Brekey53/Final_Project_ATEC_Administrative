package pt.atec.hawk_portal_app.ui.screens.turmas

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
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
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ProgressIndicatorDefaults
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import pt.atec.hawk_portal_app.model.TurmaFormador
import pt.atec.hawk_portal_app.viewmodel.TurmasFormadorViewModel
import pt.atec.hawk_portal_app.viewmodel.TurmasFormandoViewModel

@Composable
fun TurmasFormadorScreen(
    viewModel: TurmasFormadorViewModel = viewModel()
) {
    val uiState = viewModel.uiState.collectAsState().value

    LaunchedEffect(Unit) {
        viewModel.getTurmasFormador()
    }

    if (uiState.loading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
        return
    }

    val turmas = uiState.turmas

    if (turmas.isNullOrEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text("Sem turmas atribuídas.")
        }
        return
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(turmas) { turma ->
            TurmaFormadorItem(turma)
        }
    }
}


@Composable
fun TurmaFormadorItem(turma: TurmaFormador) {

    val progresso =
        if (turma.horasTotaisModulo > 0)
            turma.horasDadas.toFloat() / turma.horasTotaisModulo.toFloat()
        else 0f

    val estadoColor = when (turma.estado) {
        "Para começar" -> Color.Gray
        "A decorrer" -> Color(0xFFFF9800)
        "Terminado" -> Color(0xFF4CAF50)
        else -> Color.DarkGray
    }

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
                text = turma.nomeTurma,
                style = MaterialTheme.typography.titleMedium,
                color = Color(0xFF014D4E),
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = turma.nomeCurso,
                style = MaterialTheme.typography.bodySmall
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = turma.nomeModulo,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(8.dp))

            LinearProgressIndicator(
            progress = { progresso },
            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp),
            color = Color(0xFF014D4E),
            trackColor = Color.LightGray,
            strokeCap = ProgressIndicatorDefaults.LinearStrokeCap,
            )

            Spacer(modifier = Modifier.height(4.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "${turma.horasDadas}h / ${turma.horasTotaisModulo}h",
                    style = MaterialTheme.typography.bodySmall
                )

                Text(
                    text = turma.estado,
                    style = MaterialTheme.typography.bodySmall,
                    color = estadoColor,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
