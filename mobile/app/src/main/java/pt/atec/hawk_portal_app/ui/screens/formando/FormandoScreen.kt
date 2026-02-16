package pt.atec.hawk_portal_app.ui.screens.formando

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
import androidx.compose.runtime.getValue
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
import pt.atec.hawk_portal_app.model.Formando
import pt.atec.hawk_portal_app.ui.components.AppMenuHamburger
import pt.atec.hawk_portal_app.viewmodel.FormandosViewModel

/**
 * Composable responsável por apresentar o Ui da
 * listagem de formandos
 *
 * Integra o componente AppMenuHamburger para navegação lateral
 * e gere os diferentes estados da interface (loading,
 * erro e dados prontos) através do FormandosViewModel.
 *
 * @param onDashboard Ação de navegação para o Dashboard.
 * @param onCursos Ação de navegação para Cursos.
 * @param onFormandos Ação de navegação para Formandos.
 * @param onFormadores Ação de navegação para Formadores.
 * @param onSalas Ação de navegação para Salas.
 * @param onLogout Ação executada ao efetuar logout.
 * @param viewModel ViewModel responsável por gerir o estado da disponibilidade.
 */
@Composable
fun FormandoScreen(
    onDashboard: () -> Unit,
    onCursos: (() -> Unit)?,
    onFormandos: (() -> Unit)?,
    onFormadores: (() -> Unit)?,
    onSalas: (() -> Unit)?,
    onLogout: () -> Unit,
    viewModel: FormandosViewModel = viewModel()
) {

    val uiState by viewModel.uiState.collectAsState()

    AppMenuHamburger(
        title = "Formandos",
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
                    painter = painterResource(id = R.drawable.aluno_hawk),
                    contentDescription = "Logo Hawk Portal",
                    modifier = Modifier
                        .size(64.dp)
                        .clip(RoundedCornerShape(8.dp))
                )

                Spacer(modifier = Modifier.width(16.dp))

                Column {
                    Text(
                        text = "Formandos",
                        style = MaterialTheme.typography.headlineMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Consultar Lista de Formandos",
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

                uiState.formandos.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Sem formandos disponíveis.",
                            color = Color.White
                        )
                    }
                }

                else -> {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(uiState.formandos) { formando ->
                            FormandoItem(formando)
                        }
                    }
                }
            }
        }
    }
}

/**
 * Composable responsável por apresentar os cards de apresentação
 * dos formandos
 *
 * Mostra cards a fundo branco com sombra, e com dados dos formandos que
 * podem ter uma imagem da API ou, caso não exista, apresenta uma imagem
 * placeholder
 *
 * @param formando Objeto formando com dados
 */
@Composable
fun FormandoItem(formando: Formando) {

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
                model = formando.fotoUrl,
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
                    text = formando.nome ?: "",
                    style = MaterialTheme.typography.titleMedium,
                    color = Color(0xFF014D4E)
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = formando.email ?: "",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = formando.escolaridade ?: "",
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}