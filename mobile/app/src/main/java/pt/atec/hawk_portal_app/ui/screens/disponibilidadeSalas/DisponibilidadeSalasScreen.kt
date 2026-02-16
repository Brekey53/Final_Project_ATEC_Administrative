package pt.atec.hawk_portal_app.ui.screens.disponibilidadeSalas

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TimePicker
import androidx.compose.material3.TimePickerDefaults
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.viewmodel.compose.viewModel
import pt.atec.hawk_portal_app.R
import pt.atec.hawk_portal_app.model.DatePickerFragment
import pt.atec.hawk_portal_app.model.DisponibilidadeSalas
import pt.atec.hawk_portal_app.states.DisponibilidadeSalasUiState
import pt.atec.hawk_portal_app.ui.components.AppMenuHamburger
import pt.atec.hawk_portal_app.viewmodel.DisponibilidadeSalasViewModel

private val VerdePrincipal = Color(0xFF014D4E)

/**
 * Composable responsável por apresentar o ecrã de consulta
 * de disponibilidade de salas.
 *
 * Integra o componente AppMenuHamburger para navegação lateral
 * e gere os diferentes estados da interface (loading,
 * erro e dados prontos) através do DisponibilidadeSalasViewModel.
 *
 * @param onDashboard Ação de navegação para o Dashboard.
 * @param onCursos Ação de navegação para Cursos.
 * @param onFormandos Ação de navegação para Formandos.
 * @param onFormadores Ação de navegação para Formadores.
 * @param onTurmas Ação de navegação para Turmas.
 * @param onSalas Ação de navegação para Salas.
 * @param onLogout Ação executada ao efetuar logout.
 * @param viewModel ViewModel responsável por gerir o estado da disponibilidade.
 */
@Composable
fun DisponibilidadeSalasScreen(
    onDashboard: () -> Unit,
    onCursos: (() -> Unit)?,
    onFormandos: (() -> Unit)?,
    onFormadores: (() -> Unit)?,
    onTurmas: (() -> Unit)?,
    onSalas: (() -> Unit)?,
    onLogout: () -> Unit,
    viewModel: DisponibilidadeSalasViewModel = viewModel()
) {

    val uiState by viewModel.uiState.collectAsState()

    AppMenuHamburger(
        title = "Salas",
        onDashboard = onDashboard,
        onCursos = onCursos,
        onFormandos = onFormandos,
        onFormadores = onFormadores,
        onTurmas = onTurmas,
        onSalas = onSalas,
        onLogout = onLogout
    ) {

        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(VerdePrincipal)
        ) {

            // HEADER
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Image(
                    painter = painterResource(id = R.drawable.salas),
                    contentDescription = null,
                    modifier = Modifier.size(64.dp)
                )

                Spacer(modifier = Modifier.width(16.dp))

                Column {
                    Text(
                        text = "Salas Disponíveis",
                        style = MaterialTheme.typography.headlineMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Consultar disponibilidade",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White.copy(alpha = 0.7f)
                    )
                }
            }

            when (uiState) {

                is DisponibilidadeSalasUiState.LoadingModulos -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = Color.White)
                    }
                }

                is DisponibilidadeSalasUiState.Error -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
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
                        modifier = Modifier.fillMaxSize(),
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
}

/**
 * Composable responsável por apresentar os filtros de pesquisa
 * de disponibilidade de salas.
 *
 * Permite selecionar data, hora de início e hora de fim,
 * acionando os métodos do ViewModel para atualizar o estado
 * e executar a pesquisa.
 *
 * @param state Estado atual da interface em modo Ready.
 * @param viewModel ViewModel responsável pela lógica da pesquisa.
 */
@Composable
private fun FiltrosSalas(
    state: DisponibilidadeSalasUiState.Ready,
    viewModel: DisponibilidadeSalasViewModel
) {
    var showTimePickerFor by remember { mutableStateOf<String?>(null) }
    val context = LocalContext.current


    if (showTimePickerFor != null) {

        TimePickerModal(
            onTimeSelected = { time ->
                if (showTimePickerFor == "inicio") {
                    viewModel.HoraInicioTextoAlterado(time)
                } else {
                    viewModel.HoraFimTextoAlterado(time)
                }
            },
            onDismiss = {
            }

        )
    }

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
                label = "Data (yyyy-MM-dd)",
                onClick = {
                    val activity = context as? FragmentActivity

                    activity?.let {
                        DatePickerFragment { year, month, day ->
                            val formattedDate =
                                String.format("%04d-%02d-%02d", year, month + 1, day)
                            viewModel.DataTextoAlterado(formattedDate)
                        }.show(it.supportFragmentManager, "datePicker")
                    }
                }
            )


            // Start time field
            CampoFiltro(
                value = state.horaInicioTexto,
                onValueChange = viewModel::HoraInicioTextoAlterado,
                label = "Hora início (HH:mm)",
                onClick = { showTimePickerFor = "inicio" }
            )

            // End time field
            CampoFiltro(
                value = state.horaFimTexto,
                onValueChange = viewModel::HoraFimTextoAlterado,
                label = "Hora fim (HH:mm)",
                onClick = { showTimePickerFor = "fim" }
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

/**
 * Composable que representa um cartão individual de sala disponível.
 *
 * Apresenta o nome da sala, tipo e capacidade.
 *
 * @param sala Objeto contendo os dados da sala.
 */
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

/**
 * Composable que representa um campo de filtro apenas de leitura.
 *
 * O campo apresenta um valor e permite abrir um seletor externo
 * (como DatePicker ou TimePicker) através do clique.
 *
 * @param value Valor atual do campo.
 * @param onValueChange Função de atualização do valor (não utilizada diretamente).
 * @param label Texto apresentado como label do campo.
 * @param onClick Ação executada ao clicar no campo.
 */
@Composable
private fun CampoFiltro(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(64.dp)
    ) {
        OutlinedTextField(
            value = value,
            onValueChange = { /* Não fazer nada */ },
            label = { Text(label) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            readOnly = true,
            enabled = true,
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

        Box(
            modifier = Modifier
                .matchParentSize()
                .background(Color.Transparent)
                .clickable { onClick() }
        )
    }

}

/**
 * Composable que apresenta um diálogo modal com um selecionador de hora.
 *
 * Permite ao utilizador escolher uma hora no formato 24h
 * e devolve o valor formatado (HH:mm).
 *
 * @param onTimeSelected Função chamada quando a hora é confirmada.
 * @param onDismiss Função chamada ao fechar o diálogo.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TimePickerModal(
    onTimeSelected: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val currentTime = java.util.Calendar.getInstance()
    val timePickerState = rememberTimePickerState(
        initialHour = currentTime.get(java.util.Calendar.HOUR_OF_DAY),
        initialMinute = currentTime.get(java.util.Calendar.MINUTE),
        is24Hour = true
    )

    androidx.compose.material3.BasicAlertDialog(
        onDismissRequest = onDismiss,
        modifier = Modifier.fillMaxWidth()
    ) {
        androidx.compose.material3.Surface(
            shape = RoundedCornerShape(28.dp),
            tonalElevation = 6.dp,
            modifier = Modifier.wrapContentSize(),
            color = Color.White
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Selecionar hora",
                    style = MaterialTheme.typography.labelLarge,
                    color = VerdePrincipal,
                    modifier = Modifier
                        .align(Alignment.Start)
                        .padding(bottom = 20.dp)
                )

                TimePicker(
                    state = timePickerState,
                    colors = TimePickerDefaults.colors(
                        clockDialColor = Color(0xFFF3F4F6),
                        selectorColor = VerdePrincipal,
                        containerColor = Color.White,
                        periodSelectorSelectedContainerColor = VerdePrincipal.copy(alpha = 0.1f),
                        periodSelectorSelectedContentColor = VerdePrincipal,
                        timeSelectorSelectedContainerColor = VerdePrincipal.copy(alpha = 0.1f),
                        timeSelectorSelectedContentColor = VerdePrincipal,
                        timeSelectorUnselectedContainerColor = Color(0xFFF3F4F6),
                        clockDialSelectedContentColor = Color.White,
                        clockDialUnselectedContentColor = Color.Black
                    )
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 20.dp),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancelar", color = VerdePrincipal)
                    }
                    TextButton(onClick = {
                        val formattedTime =
                            String.format("%02d:%02d", timePickerState.hour, timePickerState.minute)
                        onTimeSelected(formattedTime)
                        onDismiss()
                    }) {
                        Text("Ok", color = VerdePrincipal)
                    }
                }
            }
        }
    }
}