package pt.atec.hawk_portal_app.ui.screens.twoFactorAuth

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun TwoFactorAuthScreen(
    onVerifySuccess: () -> Unit,
    onBackToLogin: () -> Unit
) {
    var code by remember { mutableStateOf("") }

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = "Verificação de Dois Passos", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = "Introduza o código enviado para o seu e-mail.")

        Spacer(modifier = Modifier.height(24.dp))

        OutlinedTextField(
            value = code,
            onValueChange = { if (it.length <= 6) code = it },
            label = { Text("Código de 6 dígitos") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                // Aqui chamarias o teu ViewModel para validar
                if (code.length == 6) onVerifySuccess()
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Verificar")
        }

        TextButton(onClick = onBackToLogin) {
            Text("Voltar ao Login")
        }
    }
}