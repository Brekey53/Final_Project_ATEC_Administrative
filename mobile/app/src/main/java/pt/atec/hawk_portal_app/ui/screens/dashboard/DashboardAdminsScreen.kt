package pt.atec.hawk_portal_app.ui.screens.dashboard

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import pt.atec.hawk_portal_app.ui.components.AppMenuHamburger

@Composable
fun DashboardScreen(
    onDashboard: () -> Unit,
    onCursos: () -> Unit,
    onFormandos: () -> Unit,
    onFormadores: () -> Unit,
    onSalas: () -> Unit,
    onLogout: () -> Unit
) {

    AppMenuHamburger(
        title = "Dashboard",
        onDashboard = onDashboard,
        onCursos = onCursos,
        onFormandos = onFormandos,
        onFormadores = onFormadores,
        onSalas = onSalas,
        onLogout = onLogout
    ) {

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center
        ) {
            DashboardButton("Cursos", onCursos)
            Spacer(modifier = Modifier.height(16.dp))

            DashboardButton("Formandos", onFormandos)
            Spacer(modifier = Modifier.height(16.dp))

            DashboardButton("Formadores", onFormadores)
            Spacer(modifier = Modifier.height(16.dp))

            DashboardButton("Disponibilidade de Salas", onSalas)
        }
    }
}


@Composable
fun DashboardButton(
    text: String,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.White,
            contentColor = Color(0xFF014D4E)
        )
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
    }
}


