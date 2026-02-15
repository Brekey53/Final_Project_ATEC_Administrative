package pt.atec.hawk_portal_app.ui.screens.dashboard

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import pt.atec.hawk_portal_app.ui.components.AppMenuHamburger

@Composable
fun DashboardFormadoresScreen(
    onCursos: () -> Unit,
    onTurmas: () -> Unit,
    onFormandos: () -> Unit,
    onFormadores: () -> Unit,
    onSalas: () -> Unit,
    onLogout: () -> Unit
) {
    AppMenuHamburger(
        title = "Dashboard Formador",
        onCursos = onCursos,
        onTurmas = onTurmas,
        onFormandos = onFormandos,
        onFormadores = onFormadores,
        onSalas = onSalas,
        onLogout = onLogout
    ) {

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
        ) {
            Text(
                text = "Bem-vindo, Formador",
                style = MaterialTheme.typography.headlineMedium
            )

            Spacer(modifier = Modifier.height(24.dp))

            Text("NOME DAS TURMAS")
        }
    }

}
