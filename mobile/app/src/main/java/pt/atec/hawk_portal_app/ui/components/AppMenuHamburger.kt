package pt.atec.hawk_portal_app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Divider
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.NavigationDrawerItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberDrawerState
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppMenuHamburger(
    title: String,
    onDashboard: (() -> Unit)? = null,
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

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {

            ModalDrawerSheet(
                drawerContainerColor = Color.White
            ) {

                // Header
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF014D4E))
                        .padding(vertical = 32.dp, horizontal = 16.dp)
                ) {
                    Text(
                        text = title,
                        color = Color.White,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                DrawerItem("Dashboard", onDashboard, scope, drawerState)
                DrawerItem("Cursos", onCursos, scope, drawerState)
                DrawerItem("Avaliações", onAvaliacoes, scope, drawerState)
                DrawerItem("Turmas", onTurmas, scope, drawerState)
                DrawerItem("Formandos", onFormandos, scope, drawerState)
                DrawerItem("Formadores", onFormadores, scope, drawerState)
                DrawerItem("Salas", onSalas, scope, drawerState)

                Spacer(modifier = Modifier.height(16.dp))

                Divider()

                Spacer(modifier = Modifier.height(12.dp))

                NavigationDrawerItem(
                    label = {
                        Text(
                            text = "Logout",
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Medium
                        )
                    },
                    selected = false,
                    onClick = {
                        scope.launch { drawerState.close() }
                        onLogout()
                    },
                    colors = NavigationDrawerItemDefaults.colors(
                        unselectedContainerColor = Color.Transparent,
                        unselectedTextColor = Color(0xFFB00020)
                    )
                )
            }
        }
    ) {

        Scaffold(
            containerColor = Color(0xFF014D4E),
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
                        titleContentColor = Color.White,
                        navigationIconContentColor = Color.White
                    )
                )
            }
        ) { paddingValues ->
            Box(
                modifier = Modifier
                    .padding(paddingValues)
            ) {
                content()
            }
        }
    }
}

@Composable
private fun DrawerItem(
    label: String,
    action: (() -> Unit)?,
    scope: kotlinx.coroutines.CoroutineScope,
    drawerState: androidx.compose.material3.DrawerState
) {
    action?.let {
        NavigationDrawerItem(
            label = {
                Text(
                    text = label,
                    style = MaterialTheme.typography.bodyLarge
                )
            },
            selected = false,
            onClick = {
                scope.launch { drawerState.close() }
                it()
            },
            colors = NavigationDrawerItemDefaults.colors(
                unselectedContainerColor = Color.Transparent,
                selectedContainerColor = Color(0x14014D4E),
                unselectedTextColor = Color(0xFF014D4E),
                selectedTextColor = Color(0xFF014D4E)
            )
        )

        Spacer(modifier = Modifier.height(4.dp))
    }
}

