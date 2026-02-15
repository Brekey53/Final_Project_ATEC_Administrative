package pt.atec.hawk_portal_app.ui.screens.turmas

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import pt.atec.hawk_portal_app.model.Colegas
import pt.atec.hawk_portal_app.model.ModulosTurmaFormandos
import pt.atec.hawk_portal_app.model.ProfessoresTurmaFormando
import pt.atec.hawk_portal_app.model.TurmasFormando
import pt.atec.hawk_portal_app.ui.components.AppMenuHamburger
import pt.atec.hawk_portal_app.viewmodel.TurmasFormandoViewModel

@Composable
fun TurmasFormandosScreen(
    onCursos: () -> Unit,
    onAvaliacoes: () -> Unit,
    onTurmas: () -> Unit,
    onFormandos: () -> Unit,
    onFormadores: () -> Unit,
    onLogout: () -> Unit,
    viewModel: TurmasFormandoViewModel = viewModel()
) {

    val uiState = viewModel.uiState.collectAsState().value
    var selectedTab by remember { mutableStateOf(0) }

    LaunchedEffect(Unit) {
        viewModel.getMinhaTurma()
    }

    AppMenuHamburger(
        title = "Minha Turma",
        onCursos = onCursos,
        onAvaliacoes = onAvaliacoes,
        onTurmas = onTurmas,
        onFormandos = onFormandos,
        onFormadores = onFormadores,
        onLogout = onLogout
    ) {

        Scaffold(
            containerColor = Color(0xFF014D4E)
        ) { paddingValues ->

            if (uiState.loading) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Color.White)
                }
                return@Scaffold
            }

            val turma = uiState.turma ?: return@Scaffold

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {

                ScrollableTabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = Color(0xFF014D4E),
                    contentColor = Color.White,
                    edgePadding = 16.dp,
                    divider = {}
                ) {
                    listOf("Resumo", "Módulos", "Professores", "Colegas")
                        .forEachIndexed { index, title ->
                            Tab(
                                selected = selectedTab == index,
                                onClick = { selectedTab = index },
                                text = {
                                    Text(
                                        text = title,
                                        maxLines = 1
                                    )
                                }
                            )
                        }
                }


                when (selectedTab) {
                    0 -> ResumoTabStyled(turma)
                    1 -> ModulosTabStyled(turma.modulos)
                    2 -> ProfessoresTabStyled(turma.professores)
                    3 -> ColegasTabStyled(turma.colegas)
                }
            }
        }
    }
}


@Composable
fun ResumoTabStyled(turma: TurmasFormando) {

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {

        item {
            DefaultCard {
                Text(
                    text = turma.nomeTurma,
                    style = MaterialTheme.typography.titleMedium,
                    color = Color(0xFF014D4E),
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text("Curso: ${turma.nomeCurso}")
                Text("Início: ${turma.dataInicio}")
                Text("Fim: ${turma.dataFim}")
                Text("Estado: ${turma.estado}")
            }
        }
    }
}


@Composable
fun ModulosTabStyled(modulos: List<ModulosTurmaFormandos>) {

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(modulos) { modulo ->

            DefaultCard {
                Text(
                    text = modulo.nome,
                    style = MaterialTheme.typography.titleMedium,
                    color = Color(0xFF014D4E),
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text("Horas totais: ${modulo.horasTotais}h")

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Professor:",
                    fontWeight = FontWeight.SemiBold
                )

                val professor = modulo.professores.firstOrNull()

                if (professor != null) {
                    Text(
                        text = professor.nome,
                        style = MaterialTheme.typography.bodyMedium
                    )
                } else {
                    Text(
                        text = "Sem professor atribuído",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray
                    )
                }

            }
        }
    }
}


@Composable
fun ProfessoresTabStyled(professores: List<ProfessoresTurmaFormando>) {

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(professores) { professor ->

            DefaultCard {
                Text(
                    text = professor.nome,
                    style = MaterialTheme.typography.titleMedium,
                    color = Color(0xFF014D4E),
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(professor.email)
            }
        }
    }
}


@Composable
fun ColegasTabStyled(colegas: List<Colegas>) {

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(colegas) { colega ->

            DefaultCard {
                Text(
                    text = colega.nome,
                    style = MaterialTheme.typography.titleMedium,
                    color = Color(0xFF014D4E),
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(colega.email)
            }
        }
    }
}

@Composable
fun DefaultCard(content: @Composable () -> Unit) {
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
            content()
        }
    }
}
