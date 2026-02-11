package pt.atec.hawk_portal_app.ui.screens.disponibilidadeSalas

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import pt.atec.hawk_portal_app.R
import pt.atec.hawk_portal_app.model.DisponibilidadeSalas
import pt.atec.hawk_portal_app.states.DisponibilidadeSalasUiState
import pt.atec.hawk_portal_app.viewmodel.DisponibilidadeSalasViewModel

private val VerdePrincipal = Color(0xFF014D4E)

@Composable
fun DisponibilidadeSalasScreen(
    viewModel: DisponibilidadeSalasViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(VerdePrincipal)
                    .padding(top = 48.dp, start = 20.dp, end = 20.dp, bottom = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Image(
                    painter = painterResource(id = R.drawable.professor_hawk),
                    contentDescription = "Logo Hawk Portal",
                    modifier = Modifier
                        .size(64.dp)
                )

                Spacer(modifier = Modifier.width(16.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Salas Disponíveis",
                        style = MaterialTheme.typography.headlineMedium,
                        color = Color.White,
                        fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                    )
                    Text(
                        text = "Consultar disponibilidade de salas",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White.copy(alpha = 0.7f)
                    )
                }
            }
        },
        containerColor = VerdePrincipal
    ) { paddingValues ->

        when (uiState) {

            is DisponibilidadeSalasUiState.LoadingModulos -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Color.White)
                }
            }

            is DisponibilidadeSalasUiState.Error -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = (uiState as DisponibilidadeSalasUiState.Error).message,
                        color = Color.White
                    )
                }
            }

            is DisponibilidadeSalasUiState.Ready -> {
                val state = uiState as DisponibilidadeSalasUiState.Ready

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {

                    item {
                        FiltrosSalas(state, viewModel)
                    }

                    if (state.loadingSalas) {
                        item {
                            Box(
                                modifier = Modifier.fillMaxWidth(),
                                contentAlignment = Alignment.Center
                            ) {
                                CircularProgressIndicator(color = Color.White)
                            }
                        }
                    } else if (state.salas.isEmpty() && state.pesquisaFeita) {
                        item {
                            Text(
                                text = "Nenhuma sala disponível",
                                color = Color.White
                            )
                        }
                    } else {
                        items(state.salas) { sala ->
                            SalaItem(sala)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun FiltrosSalas(
    state: DisponibilidadeSalasUiState.Ready,
    viewModel: DisponibilidadeSalasViewModel
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {

            CampoFiltro(
                value = state.dataTexto,
                onValueChange = viewModel::DataTextoAlterado,
                label = "Data (yyyy-MM-dd)"
            )

            CampoFiltro(
                value = state.horaInicioTexto,
                onValueChange = viewModel::HoraInicioTextoAlterado,
                label = "Hora início (HH:mm)"
            )

            CampoFiltro(
                value = state.horaFimTexto,
                onValueChange = viewModel::HoraFimTextoAlterado,
                label = "Hora fim (HH:mm)"
            )

            Button(
                onClick = { viewModel.onPesquisarClick() },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = VerdePrincipal,
                    contentColor = Color.White
                ),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Pesquisar salas")
            }
            Button(
                onClick = {
                    viewModel.onLimparPesquisaClick()
                },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.White,
                    contentColor = VerdePrincipal
                ),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Limpar pesquisa")
            }

        }
    }
}

@Composable
fun SalaItem(sala: DisponibilidadeSalas) {

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
                text = sala.nomeSala ?: "",
                style = MaterialTheme.typography.titleMedium,
                color = VerdePrincipal
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Tipo: ${sala.tipo ?: ""}",
                style = MaterialTheme.typography.bodyMedium
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "Capacidade: ${sala.capacidade} Formandos",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

@Composable
private fun CampoFiltro(
    value: String,
    onValueChange: (String) -> Unit,
    label: String
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedContainerColor = Color.White,
            unfocusedContainerColor = Color.White,
            focusedBorderColor = Color(0xFF014D4E),
            unfocusedBorderColor = Color(0xFF014D4E),
            focusedLabelColor = Color(0xFF014D4E),
            unfocusedLabelColor = Color(0xFF014D4E),
            cursorColor = Color(0xFF014D4E),
            focusedTextColor = Color.Black,
            unfocusedTextColor = Color.Black
        )
    )
}
