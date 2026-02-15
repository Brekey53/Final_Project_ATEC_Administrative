package pt.atec.hawk_portal_app.ui.components

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Divider
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppMenuHamburger(
    title: String,
    onCursos: (() -> Unit)? = null,
    onAvaliacoes: (() -> Unit)? = null,
    onTurmas: (() -> Unit)? = null,
    onFormandos: (() -> Unit)? = null,
    onFormadores: (() -> Unit)? = null,
    onSalas: (() -> Unit)? = null,
    onLogout: () -> Unit,
    content: @Composable () -> Unit
) {

    val drawerState = rememberDrawerState(DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    ModalNavigationDrawer(   // 👈 ISTO É OBRIGATÓRIO
        drawerState = drawerState,
        drawerContent = {

            ModalDrawerSheet {

                Spacer(modifier = androidx.compose.ui.Modifier.height(24.dp))

                onCursos?.let {
                    NavigationDrawerItem(
                        label = { Text("Cursos") },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                            it()
                        }
                    )
                }

                onAvaliacoes?.let {
                    NavigationDrawerItem(
                        label = { Text("Avaliações") },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                            it()
                        }
                    )
                }

                onTurmas?.let {
                    NavigationDrawerItem(
                        label = { Text("Turmas") },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                            it()
                        }
                    )
                }

                onFormandos?.let {
                    NavigationDrawerItem(
                        label = { Text("Formandos") },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                            it()
                        }
                    )
                }

                onFormadores?.let {
                    NavigationDrawerItem(
                        label = { Text("Formadores") },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                            it()
                        }
                    )
                }

                onSalas?.let {
                    NavigationDrawerItem(
                        label = { Text("Salas") },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                            it()
                        }
                    )
                }

                Divider()

                NavigationDrawerItem(
                    label = { Text("Logout") },
                    selected = false,
                    onClick = {
                        scope.launch { drawerState.close() }
                        onLogout()
                    }
                )
            }
        }
    ) {

        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text(title) },
                    navigationIcon = {
                        IconButton(
                            onClick = {
                                scope.launch { drawerState.open() }
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Default.Menu,
                                contentDescription = "Menu"
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color(0xFF014D4E),
                        titleContentColor = Color.White
                    )
                )
            }
        ) { paddingValues ->
            androidx.compose.foundation.layout.Box(
                modifier = androidx.compose.ui.Modifier
                    .padding(paddingValues)
            ) {
                content()
            }
        }
    }
}

