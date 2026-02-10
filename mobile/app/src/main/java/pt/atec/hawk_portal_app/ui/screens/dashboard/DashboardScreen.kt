package pt.atec.hawk_portal_app.ui.screens.dashboard

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun DashboardScreen(
    onCursos: () -> Unit,
    onFormandos: () -> Unit,
    onFormadores: () -> Unit,
    onSalas: () -> Unit,
    onLogout: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center
    ) {

        Text("Dashboard")

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            modifier = Modifier.fillMaxWidth(),
            onClick = onCursos,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF014D4E))
        ) {
            Text("Cursos")
        }

        Spacer(modifier = Modifier.height(12.dp))

        Button(
            modifier = Modifier.fillMaxWidth(),
            onClick = onFormandos,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF014D4E))
        ) {
            Text("Formandos")
        }

        Spacer(modifier = Modifier.height(12.dp))

        Button(
            modifier = Modifier.fillMaxWidth(),
            onClick = onFormadores,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF014D4E))
        ) {
            Text("Formadores")
        }

        Spacer(modifier = Modifier.height(12.dp))

        Button(
            modifier = Modifier.fillMaxWidth(),
            onClick = onSalas,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF014D4E))
        ) {
            Text("Disponibilidade de Salas")
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            modifier = Modifier.fillMaxWidth(),
            onClick = onLogout,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF014D4E))
        ) {
            Text("Logout")
        }
    }
}

