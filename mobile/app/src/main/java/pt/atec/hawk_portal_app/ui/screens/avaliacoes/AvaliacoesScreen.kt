package pt.atec.hawk_portal_app.ui.screens.avaliacoes

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import pt.atec.hawk_portal_app.model.AvaliacoesFormando
import pt.atec.hawk_portal_app.ui.components.AppMenuHamburger
import pt.atec.hawk_portal_app.viewmodel.AvaliacoesViewModel

@Composable
fun AvaliacoesScreen(
    onDashboard: () -> Unit,
    onCursos: () -> Unit,
    onAvaliacoes: () -> Unit,
    onTurmas: () -> Unit,
    onLogout: () -> Unit,
    viewModel: AvaliacoesViewModel = viewModel()
) {

    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.getAvaliacoes()
    }

    AppMenuHamburger(
        title = "Avaliações",
        onDashboard = onDashboard,
        onCursos = onCursos,
        onAvaliacoes = onAvaliacoes,
        onTurmas = onTurmas,
        onLogout = onLogout
    ) {

        Scaffold(
            containerColor = Color(0xFF014D4E)
        ) { paddingValues ->

            when {
                uiState.loading -> {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = Color.White)
                    }
                }

                uiState.error != null -> {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = uiState.error!!,
                            color = Color.White
                        )
                    }
                }

                else -> {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues)
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(uiState.avaliacoes) { avaliacao ->
                            AvaliacaoCard(avaliacao)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AvaliacaoCard(avaliacao: AvaliacoesFormando) {

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
                text = avaliacao.nomeModulo,
                style = MaterialTheme.typography.titleMedium,
                color = Color(0xFF014D4E),
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Nota: ${avaliacao.nota ?: "—"}",
                style = MaterialTheme.typography.bodyMedium
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "Data: ${avaliacao.dataAvaliacao}",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}
