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

/**
 * Composable responsável por apresentar o ecrã da turma do formando.
 *
 * Este ecrã:
 * - Obtém os dados da turma através do TurmasFormandoViewModel.
 * - Executa a função getMinhaTurma() quando o ecrã é iniciado.
 * - Mostra um indicador de loading enquanto os dados são obtidos.
 * - Apresenta diferentes separadores (tabs): Resumo, Módulos,
 *   Professores e Colegas.
 * - Alterna dinamicamente o conteúdo consoante o separador selecionado.
 *
 * O estado da interface é observado através de uiState,
 * recolhido a partir do ViewModel.
 *
 * @param onDashboard Função de navegação para o ecrã Dashboard.
 * @param onCursos Função de navegação para o ecrã Cursos.
 * @param onAvaliacoes Função opcional de navegação para o ecrã Avaliações.
 * @param onTurmas Função de navegação para o ecrã Turmas.
 * @param onLogout Função executada ao terminar sessão.
 * @param viewModel ViewModel responsável por gerir os dados da turma do formando.
 */
@Composable
fun TurmasFormandosScreen(
    onDashboard: () -> Unit,
    onCursos: () -> Unit,
    onAvaliacoes: (() -> Unit)?,
    onTurmas: () -> Unit,
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
        onDashboard = onDashboard,
        onCursos = onCursos,
        onAvaliacoes = onAvaliacoes,
        onTurmas = onTurmas,
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

/**
 * Composable responsável por apresentar o separador "Resumo".
 *
 * Mostra informação geral da turma:
 * - Nome da turma
 * - Nome do curso
 * - Data de início
 * - Data de fim
 * - Estado atual
 *
 * @param turma Objeto TurmasFormando com os dados gerais da turma.
 */
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

/**
 * Composable responsável por apresentar o separador "Módulos".
 *
 * Lista todos os módulos associados à turma,
 * apresentando:
 * - Nome do módulo
 * - Total de horas
 * - Professor associado (caso exista)
 *
 * @param modulos Lista de módulos pertencentes à turma.
 */
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

/**
 * Composable responsável por apresentar o separador "Professores".
 *
 * Lista todos os professores associados à turma,
 * apresentando:
 * - Nome
 * - Email
 *
 * @param professores Lista de professores da turma.
 */
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

/**
 * Composable responsável por apresentar o separador "Colegas".
 *
 * Lista todos os colegas pertencentes à turma,
 * apresentando:
 * - Nome
 * - Email
 *
 * @param colegas Lista de colegas da turma.
 */
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

/**
 * Composable reutilizável que define um cartão com estilo padrão da aplicação.
 *
 * Aplica:
 * - Fundo branco
 * - Cantos arredondados
 * - Elevação (shadow)
 * - Padding
 *
 * Recebe como parâmetro o conteúdo composable a ser exibido dentro do cartão.
 *
 * @param content Conteúdo composable a ser renderizado dentro do cartão.
 */
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