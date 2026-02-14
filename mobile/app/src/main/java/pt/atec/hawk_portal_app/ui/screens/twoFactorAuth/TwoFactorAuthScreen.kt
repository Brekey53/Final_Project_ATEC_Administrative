package pt.atec.hawk_portal_app.ui.screens.twoFactorAuth

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
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import pt.atec.hawk_portal_app.dataStore.TokenDataStore
import pt.atec.hawk_portal_app.model.AuthSession
import pt.atec.hawk_portal_app.viewmodel.TwoFactorViewModel

@Composable
fun TwoFactorAuthScreen(
    onVerifySuccess: () -> Unit,
    onBackToLogin: () -> Unit,
    viewModel: TwoFactorViewModel = viewModel()
) {
    val email = AuthSession.email
    if (email == null) {
        onBackToLogin()
        return
    }

    var code by remember { mutableStateOf("") }

    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    val token by viewModel.token.collectAsState()

    val context = LocalContext.current

    LaunchedEffect(token) {
        token?.let {
            TokenDataStore.saveToken(context, it)
            AuthSession.email = null
            onVerifySuccess()
        }
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFF014D4E)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            Spacer(modifier = Modifier.weight(1f))

            Text(
                text = "Verificação de Dois Passos",
                color = Color.White,
                style = MaterialTheme.typography.headlineMedium
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Introduz o código enviado para o teu e-mail",
                color = Color.White.copy(alpha = 0.8f),
                style = MaterialTheme.typography.bodyMedium
            )

            Spacer(modifier = Modifier.height(32.dp))

            TextField(
                value = code,
                onValueChange = {
                    if (it.length <= 6) code = it
                    if (error != null) viewModel.clearError()
                },
                label = { Text("Código de 6 dígitos") },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = TextFieldDefaults.colors(
                    focusedTextColor = Color(0xFF014D4E),
                    unfocusedTextColor = Color(0xFF014D4E),
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White.copy(alpha = 0.95f),
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    cursorColor = Color(0xFF014D4E),
                    focusedLabelColor = Color(0xFF014D4E),
                    unfocusedLabelColor = Color(0xFF014D4E)
                )
            )

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = { viewModel.verifyCode(email, code) },
                enabled = code.length == 6 && !isLoading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.White,
                    contentColor = Color(0xFF014D4E)
                )
            ) {
                Text(
                    text = if (isLoading) "A verificar..." else "Verificar",
                    style = MaterialTheme.typography.titleMedium
                )
            }

            if (error != null) {
                Spacer(modifier = Modifier.height(20.dp))
                Surface(
                    color = Color.Red.copy(alpha = 0.1f), // Subtle red background
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = error!!,
                        color = Color(0xFFFEB2B1),
                        modifier = Modifier.padding(12.dp),
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp,
                        textAlign = TextAlign.Center
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f))
        }
    }
}
