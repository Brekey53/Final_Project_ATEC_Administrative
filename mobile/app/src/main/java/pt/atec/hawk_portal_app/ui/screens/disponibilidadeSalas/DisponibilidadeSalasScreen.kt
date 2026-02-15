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
import androidx.compose.material3.Scaffold
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
import pt.atec.hawk_portal_app.viewmodel.CursosViewModel
import pt.atec.hawk_portal_app.viewmodel.DisponibilidadeSalasViewModel

private val VerdePrincipal = Color(0xFF014D4E)

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
                showTimePickerFor = null
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
            ) // CampoFiltro


            // Start time field
            CampoFiltro(
                value = state.horaInicioTexto,
                onValueChange = viewModel::HoraInicioTextoAlterado,
                label = "Hora início (HH:mm)",
                onClick = { showTimePickerFor = "inicio" }
            ) // CampoFiltro

            // End time field
            CampoFiltro(
                value = state.horaFimTexto,
                onValueChange = viewModel::HoraFimTextoAlterado,
                label = "Hora fim (HH:mm)",
                onClick = { showTimePickerFor = "fim" }
            ) // CampoFiltro


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
            //onValueChange = onValueChange,
            onValueChange = { /* Não fazer nada */ },
            label = { Text(label) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            readOnly = true, // no show keyboard and prevents editing
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

        // Transparent clickable surface on top of TextField
        Box(
            modifier = Modifier
                .matchParentSize()
                .background(Color.Transparent)
                .clickable { onClick() }
        )
    }

}

//@Composable
//fun DatePickerButton(onDateSelected: (String) -> Unit) {
//    val context = LocalContext.current
//
//    Button(
//        onClick = {
//            val activity = context as? FragmentActivity
//            activity?.let {
//                val datePicker = DatePickerFragment { year, month, day ->
//                    val formattedDate = String.format("%04d-%02d-%02d", year, month + 1, day)
//                    onDateSelected(formattedDate)
//                }
//                datePicker.show(it.supportFragmentManager, "datePicker")
//            }
//        },
//        modifier = Modifier.fillMaxWidth(),
//        colors = ButtonDefaults.buttonColors(
//            containerColor = Color.Gray.copy(alpha = 0.2f),
//            contentColor = VerdePrincipal
//        ),
//        shape = RoundedCornerShape(10.dp)
//    ) {
//        Text("Abrir Calendário")
//    }
//}

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
                // Title
                Text(
                    text = "Selecionar hora",
                    style = MaterialTheme.typography.labelLarge,
                    color = VerdePrincipal,
                    modifier = Modifier
                        .align(Alignment.Start)
                        .padding(bottom = 20.dp)
                )

                // The Clock with Custom Colors
                TimePicker(
                    state = timePickerState,
                    colors = TimePickerDefaults.colors(
                        clockDialColor = Color(0xFFF3F4F6),        // Light gray background
                        selectorColor = VerdePrincipal,            // Green moving arm
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

                // Buttons Row
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