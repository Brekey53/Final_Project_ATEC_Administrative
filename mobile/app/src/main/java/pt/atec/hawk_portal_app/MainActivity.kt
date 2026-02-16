package pt.atec.hawk_portal_app

import android.os.Build
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.fragment.app.FragmentActivity
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import pt.atec.hawk_portal_app.dataStore.TokenDataStore
import pt.atec.hawk_portal_app.model.AuthSession
import pt.atec.hawk_portal_app.ui.screens.avaliacoes.AvaliacoesScreen
import pt.atec.hawk_portal_app.ui.screens.cursos.CursosScreen
import pt.atec.hawk_portal_app.ui.screens.dashboard.DashboardFormadoresScreen
import pt.atec.hawk_portal_app.ui.screens.dashboard.DashboardFormandosScreen
import pt.atec.hawk_portal_app.ui.screens.dashboard.DashboardScreen
import pt.atec.hawk_portal_app.ui.screens.disponibilidadeSalas.DisponibilidadeSalasScreen
import pt.atec.hawk_portal_app.ui.screens.formadores.FormadoresScreen
import pt.atec.hawk_portal_app.ui.screens.formando.FormandoScreen
import pt.atec.hawk_portal_app.ui.screens.login.LoginScreen
import pt.atec.hawk_portal_app.ui.screens.turmas.TurmasFormadorScreen
import pt.atec.hawk_portal_app.ui.screens.turmas.TurmasFormandosScreen
import pt.atec.hawk_portal_app.ui.screens.twoFactorAuth.TwoFactorAuthScreen
import pt.atec.hawk_portal_app.utils.JwtUtils

/**
 * Objeto que centraliza todas as rotas utilizadas
 * no sistema de navegação da aplicação.
 *
 * Cada constante representa o identificador
 * de um ecrã utilizado pelo NavHost.
 */
object Routes {
    const val LOGIN = "login"
    const val TWO_FACTOR = "2fa"
    const val DASHBOARDFORMANDOS = "dashboard-formandos"
    const val DASHBOARDFORMADORES = "dashboard-formadores"
    const val DASHBOARDADMINS = "dashboard-admins"
    const val CURSOS = "cursos"
    const val FORMADORES = "formadores"
    const val FORMANDOS = "formandos"
    const val DISPONIBILIDADE_SALAS = "disponibilidade-salas"
    const val AVALIACOES = "avaliacoes"
    const val TURMASFORMANDO = "turmas-formando"
    const val TURMASFORMADOR = "turmas-formador"
}

/**
 * Activity principal da aplicação.
 *
 * Responsável por:
 * - Inicializar o conteúdo Compose.
 * - Definir a superfície base da aplicação.
 * - Invocar o sistema de navegação através de AppNavigation().
 *
 * Esta Activity serve como ponto de entrada
 * da aplicação Android.
 */
class MainActivity : FragmentActivity() {
    @RequiresApi(Build.VERSION_CODES.O)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Surface(
                modifier = Modifier.fillMaxSize(),
                color = MaterialTheme.colorScheme.background
            ) {
                AppNavigation()
            }
        }
    }
}

/**
 * Composable responsável por configurar o sistema
 * de navegação da aplicação.
 *
 * Utiliza NavHost para definir:
 * - Ecrã inicial (Login).
 * - Fluxo de autenticação (Login + 2FA).
 * - Dashboards específicos por tipo de utilizador.
 * - Regras de navegação com base em permissões.
 *
 * A função:
 * - Obtém o token guardado no DataStore.
 * - Extrai o tipo de utilizador a partir do JWT.
 * - Define permissões dinâmicas de acesso aos ecrãs.
 * - Controla a navegação condicional consoante o perfil.
 */
@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun AppNavigation() {

    val navController = rememberNavController()
    val context = LocalContext.current

    var tipo by remember { mutableStateOf<Int?>(null) }

    LaunchedEffect(Unit) {
        val token = TokenDataStore.getTokenOnce(context)
        tipo = token?.let { JwtUtils.getTipoUtilizador(it) }
    }

    val isAdmin = tipo in listOf(1, 4)
    val isFormador = tipo == 2
    val isFormando = tipo == 3

    // Permissões
    fun podeVerCursos() = isAdmin || isFormador || isFormando
    fun podeVerFormandos() = isAdmin
    fun podeVerFormadores() = isAdmin
    fun podeVerSalas() = isAdmin || isFormador
    fun podeVerTurmas() = isFormador || isFormando
    fun podeVerAvaliacoes() = isFormando

    fun dashboardRoute(): String {
        return when {
            isAdmin -> Routes.DASHBOARDADMINS
            isFormador -> Routes.DASHBOARDFORMADORES
            isFormando -> Routes.DASHBOARDFORMANDOS
            else -> Routes.LOGIN
        }
    }

    NavHost(
        navController = navController,
        startDestination = Routes.LOGIN
    ) {

        composable(Routes.LOGIN) {
            LoginScreen(
                onLoginSuccess = { email ->
                    AuthSession.email = email
                    navController.navigate(Routes.TWO_FACTOR)
                }
            )
        }

        composable(Routes.TWO_FACTOR) {
            TwoFactorAuthScreen(
                onVerifySuccess = { tipoRecebido ->

                    tipo = tipoRecebido

                    navController.navigate(
                        when (tipoRecebido) {
                            1, 4, 6 -> Routes.DASHBOARDADMINS
                            2 -> Routes.DASHBOARDFORMADORES
                            3 -> Routes.DASHBOARDFORMANDOS
                            else -> Routes.LOGIN
                        }
                    ) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                onBackToLogin = { navController.popBackStack() }
            )
        }


        composable(Routes.DASHBOARDADMINS) {
            DashboardScreen(
                onDashboard = { navController.navigate(dashboardRoute()) },
                onCursos = { navController.navigate(Routes.CURSOS) },
                onFormandos = { navController.navigate(Routes.FORMANDOS) },
                onFormadores = { navController.navigate(Routes.FORMADORES) },
                onSalas = { navController.navigate(Routes.DISPONIBILIDADE_SALAS) },
                onLogout = {
                    AuthSession.email = null
                    navController.navigate(Routes.LOGIN) { popUpTo(0) }
                }
            )
        }

        composable(Routes.DASHBOARDFORMADORES) {
            DashboardFormadoresScreen(
                onDashboard = { navController.navigate(dashboardRoute()) },
                onCursos = { navController.navigate(Routes.CURSOS) },
                onTurmas = { navController.navigate(Routes.TURMASFORMADOR) },
                onSalas = { navController.navigate(Routes.DISPONIBILIDADE_SALAS) },
                onLogout = {
                    AuthSession.email = null
                    navController.navigate(Routes.LOGIN) { popUpTo(0) }
                }
            )
        }

        composable(Routes.DASHBOARDFORMANDOS) {
            DashboardFormandosScreen(
                onDashboard = { navController.navigate(dashboardRoute()) },
                onCursos = { navController.navigate(Routes.CURSOS) },
                onAvaliacoes = { navController.navigate(Routes.AVALIACOES) },
                onTurmas = { navController.navigate(Routes.TURMASFORMANDO) },
                onLogout = {
                    AuthSession.email = null
                    navController.navigate(Routes.LOGIN) { popUpTo(0) }
                }
            )
        }

        composable(Routes.CURSOS) {
            CursosScreen(
                onDashboard = { navController.navigate(dashboardRoute()) },
                onCursos = { navController.navigate(Routes.CURSOS) },
                onFormandos = if (podeVerFormandos()) { { navController.navigate(Routes.FORMANDOS) } } else null,
                onFormadores = if (podeVerFormadores()) { { navController.navigate(Routes.FORMADORES) } } else null,
                onAvaliacoes = if (podeVerAvaliacoes()) { { navController.navigate(Routes.AVALIACOES) } } else null,
                onSalas = if (podeVerSalas()) { { navController.navigate(Routes.DISPONIBILIDADE_SALAS) } } else null,
                onTurmas = if (podeVerTurmas()) {
                    {
                        if (isFormador)
                            navController.navigate(Routes.TURMASFORMADOR)
                        else if (isFormando)
                            navController.navigate(Routes.TURMASFORMANDO)
                    }
                } else null,
                onLogout = {
                    AuthSession.email = null
                    navController.navigate(Routes.LOGIN) { popUpTo(0) }
                }
            )
        }

        composable(Routes.DISPONIBILIDADE_SALAS) {
            DisponibilidadeSalasScreen(
                onDashboard = { navController.navigate(dashboardRoute()) },
                onCursos = if (podeVerCursos()) { { navController.navigate(Routes.CURSOS) } } else null,
                onFormandos = if (podeVerFormandos()) { { navController.navigate(Routes.FORMANDOS) } } else null,
                onFormadores = if (podeVerFormadores()) { { navController.navigate(Routes.FORMADORES) } } else null,
                onSalas = if (podeVerSalas()) { { navController.navigate(Routes.DISPONIBILIDADE_SALAS) } } else null,
                onTurmas = if (podeVerTurmas()) {
                    {
                        if (isFormador)
                            navController.navigate(Routes.TURMASFORMADOR)
                        else if (isFormando)
                            navController.navigate(Routes.TURMASFORMANDO)
                    }
                } else null,
                onLogout = {
                    AuthSession.email = null
                    navController.navigate(Routes.LOGIN) { popUpTo(0) }
                }
            )
        }

        composable(Routes.TURMASFORMADOR) {
            TurmasFormadorScreen(
                onDashboard = { navController.navigate(dashboardRoute()) },
                onCursos = { navController.navigate(Routes.CURSOS) },
                onTurmas = { navController.navigate(Routes.TURMASFORMADOR) },
                onSalas = if (podeVerSalas()) { { navController.navigate(Routes.DISPONIBILIDADE_SALAS) } } else null,
                onLogout = {
                    AuthSession.email = null
                    navController.navigate(Routes.LOGIN) { popUpTo(0) }
                }
            )
        }

        composable(Routes.TURMASFORMANDO) {
            TurmasFormandosScreen(
                onDashboard = { navController.navigate(dashboardRoute()) },
                onCursos = { navController.navigate(Routes.CURSOS) },
                onAvaliacoes = if (podeVerAvaliacoes()) { { navController.navigate(Routes.AVALIACOES) } } else null,
                onTurmas = { navController.navigate(Routes.TURMASFORMANDO) },
                onLogout = {
                    AuthSession.email = null
                    navController.navigate(Routes.LOGIN) { popUpTo(0) }
                }
            )
        }

        composable(Routes.AVALIACOES) {
            AvaliacoesScreen(
                onDashboard = { navController.navigate(dashboardRoute()) },
                onCursos = { navController.navigate(Routes.CURSOS) },
                onAvaliacoes = { navController.navigate(Routes.AVALIACOES) },
                onTurmas = { navController.navigate(Routes.TURMASFORMANDO) },
                onLogout = {
                    AuthSession.email = null
                    navController.navigate(Routes.LOGIN) { popUpTo(0) }
                }
            )
        }

        composable(Routes.FORMADORES) {
            FormadoresScreen(
                onDashboard = { navController.navigate(dashboardRoute()) },
                onCursos = { navController.navigate(Routes.CURSOS) },
                onFormandos = { navController.navigate(Routes.FORMANDOS) },
                onFormadores = { navController.navigate(Routes.FORMADORES) },
                onSalas = { navController.navigate(Routes.DISPONIBILIDADE_SALAS) },
                onLogout = {
                    AuthSession.email = null
                    navController.navigate(Routes.LOGIN) { popUpTo(0) }
                }
            )
        }

        composable(Routes.FORMANDOS) {
            FormandoScreen(
                onDashboard = { navController.navigate(dashboardRoute()) },
                onCursos = { navController.navigate(Routes.CURSOS) },
                onFormandos = { navController.navigate(Routes.FORMANDOS) },
                onFormadores = { navController.navigate(Routes.FORMADORES) },
                onSalas = { navController.navigate(Routes.DISPONIBILIDADE_SALAS) },
                onLogout = {
                    AuthSession.email = null
                    navController.navigate(Routes.LOGIN) { popUpTo(0) }
                }
            )
        }
    }
}