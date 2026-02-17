package pt.atec.hawk_portal_app.ui.screens.formadores

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import pt.atec.hawk_portal_app.R
import pt.atec.hawk_portal_app.model.Formador
import pt.atec.hawk_portal_app.ui.components.AppMenuHamburger
import pt.atec.hawk_portal_app.viewmodel.FormadoresViewModel

/**
 * Composable responsável por apresentar o ecrã de listagem dos formadores.
 *
 * Este ecrã:
 * - Mostra um menu lateral (AppMenuHamburger).
 * - Apresenta um cabeçalho com título e descriçãoe e foto.
 * - Mostra um indicador de loading enquanto os dados são carregados.
 * - Apresenta uma mensagem caso não existam formadores.
 * - Exibe uma lista de formadores usando LazyColumn.
 *
 * @param onDashboard Função de navegação para o ecrã Dashboard.
 * @param onCursos Função opcional de navegação para o ecrã Cursos.
 * @param onFormandos Função opcional de navegação para o ecrã Formandos.
 * @param onFormadores Função opcional de navegação para o ecrã Formadores.
 * @param onSalas Função opcional de navegação para o ecrã Salas.
 * @param onLogout Função para fazer logout.
 * @param viewModel ViewModel responsável por fornecer e gerir os dados dos formadores.
 */

@Composable
fun FormadoresScreen(
    onDashboard: () -> Unit,
    onCursos: (() -> Unit)?,
    onFormandos: (() -> Unit)?,
    onFormadores: (() -> Unit)?,
    onSalas: (() -> Unit)?,
    onLogout: () -> Unit,
    viewModel: FormadoresViewModel = viewModel()
) {
    val uiState = viewModel.uiState.collectAsState().value
    AppMenuHamburger(
        title = "Formadores",
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
                .background(Color(0xFF014D4E))
        ) {

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Image(
                    painter = painterResource(id = R.drawable.professor_hawk),
                    contentDescription = "Logo Hawk Portal Professor",
                    modifier = Modifier
                        .size(64.dp)
                        .clip(RoundedCornerShape(8.dp))
                )

                Spacer(modifier = Modifier.width(16.dp))

                Column {
                    Text(
                        text = "Formadores",
                        style = MaterialTheme.typography.headlineMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Consultar Lista de Formadores",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White.copy(alpha = 0.7f)
                    )
                }
            }

            when {
                uiState.loading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = Color.White)
                    }
                }

                uiState.formadores.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Sem formadores disponíveis.",
                            color = Color.White
                        )
                    }
                }

                else -> {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(uiState.formadores) { formador ->
                        FormadorItem(formador)
                        }
                    }
                }
            }
        }
    }
}

/**
 * Composable responsável por representar um card de um formador
 *
 * Cada item apresenta:
 * - Fotografia do formador
 * - Nome.
 * - Email.
 * - Qualificações.
 *
 * É utilizado dentro de uma LazyColumn no ecrã FormadoresScreen.
 *
 * @param formador Objeto do tipo Formador que contém os dados a apresentar.
 */
@Composable
fun FormadorItem(formador: Formador) {

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {

            AsyncImage(
                model = formador.fotoUrl,
                contentDescription = "Foto do formador",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape),
                placeholder = painterResource(R.drawable.ic_user_placeholder),
                error = painterResource(R.drawable.ic_user_placeholder)
            )

            Spacer(modifier = Modifier.width(16.dp))

            Column(
                modifier = Modifier.weight(1f)
            ) {

                Text(
                    text = formador.nome ?: "",
                    style = MaterialTheme.typography.titleMedium,
                    color = Color(0xFF014D4E)
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = formador.email ?: "",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = formador.qualificacoes ?: "",
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}