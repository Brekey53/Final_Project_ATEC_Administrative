package pt.atec.hawk_portal_app.ui.screens.dashboard

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import pt.atec.hawk_portal_app.ui.components.AppMenuHamburger
import pt.atec.hawk_portal_app.viewmodel.AvaliacoesViewModel

@Composable
fun DashboardFormandosScreen(
    onCursos: () -> Unit,
    onAvaliacoes: () -> Unit,
    onTurmas: () -> Unit = {},
    onFormandos: () -> Unit,
    onFormadores: () -> Unit,
    onLogout: () -> Unit
) {

    val viewModel: AvaliacoesViewModel = viewModel()
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.getAvaliacoes()
    }

    AppMenuHamburger(
        title = "Dashboard Formando",
        onCursos = onCursos,
        onAvaliacoes = onAvaliacoes,
        onTurmas = onTurmas,
        onFormandos = onFormandos,
        onFormadores = onFormadores,
        onLogout = onLogout
    ) {

    }
}
