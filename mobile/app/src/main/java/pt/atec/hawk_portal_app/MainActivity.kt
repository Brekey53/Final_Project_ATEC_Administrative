package pt.atec.hawk_portal_app

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.fragment.app.FragmentActivity
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import pt.atec.hawk_portal_app.model.AuthSession
import pt.atec.hawk_portal_app.ui.screens.avaliacoes.AvaliacoesScreen
import pt.atec.hawk_portal_app.ui.screens.cursos.CursosScreen
import pt.atec.hawk_portal_app.ui.screens.dashboard.DashboardFormandosScreen
import pt.atec.hawk_portal_app.ui.screens.dashboard.DashboardFormadoresScreen
import pt.atec.hawk_portal_app.ui.screens.disponibilidadeSalas.DisponibilidadeSalasScreen
import pt.atec.hawk_portal_app.ui.screens.formadores.FormadoresScreen
import pt.atec.hawk_portal_app.ui.screens.dashboard.DashboardScreen
import pt.atec.hawk_portal_app.ui.screens.formando.FormandoScreen
import pt.atec.hawk_portal_app.ui.screens.login.LoginScreen
import pt.atec.hawk_portal_app.ui.screens.twoFactorAuth.TwoFactorAuthScreen
import pt.atec.hawk_portal_app.ui.screens.turmas.TurmasFormandosScreen
import pt.atec.hawk_portal_app.ui.screens.turmas.TurmasFormadorScreen
object Routes {
    const val LOGIN = "login"
    const val TWO_FACTOR = "2fa"

    const val DASHBOARDFORMANDOS = "dashboard-formandos"

    const val DASHBOARDFORMADORES= "dashboard-formadores"

    const val DASHBOARDADMINS= "dashboard-admins"

    const val CURSOS = "cursos"
    const val FORMADORES = "formadores"
    const val FORMANDOS = "formandos"
    const val DISPONIBILIDADE_SALAS = "disponibilidade-salas"
    const val AVALIACOES = "avaliacoes"
    const val TURMASFORMANDO = "turmas-formando"
    const val TURMASFORMADOR = "turmas-formador"


}

class MainActivity : FragmentActivity() {
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

@Composable
fun AppNavigation() {

    val navController = rememberNavController()

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
                onVerifySuccess = { tipo ->
                    when (tipo) {
                        1, 4, 6 -> navController.navigate(Routes.DASHBOARDADMINS) {
                            popUpTo(Routes.LOGIN) { inclusive = true }
                            launchSingleTop = true
                        }
                        2 -> navController.navigate(Routes.DASHBOARDFORMADORES) {
                            popUpTo(Routes.LOGIN) { inclusive = true }
                            launchSingleTop = true
                        }
                        3 -> navController.navigate(Routes.DASHBOARDFORMANDOS) {
                            popUpTo(Routes.LOGIN) { inclusive = true }
                            launchSingleTop = true
                        }
                    }
                },
                onBackToLogin = {
                    navController.popBackStack()
                }
            )
        }



        composable(Routes.FORMANDOS) {
            FormandoScreen()
        }

        composable(Routes.DASHBOARDADMINS) {
            DashboardScreen(
                onCursos = { navController.navigate(Routes.CURSOS) },
                onFormandos = { navController.navigate(Routes.FORMANDOS) },
                onFormadores = { navController.navigate(Routes.FORMADORES) },
                onSalas = { navController.navigate(Routes.DISPONIBILIDADE_SALAS) },
                onLogout = {
                    AuthSession.email = null
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(Routes.DASHBOARDADMINS) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.DASHBOARDFORMANDOS) {
            DashboardFormandosScreen(
                onCursos = { navController.navigate(Routes.CURSOS) },
                onAvaliacoes = { navController.navigate(Routes.AVALIACOES) },
                onTurmas = { navController.navigate(Routes.TURMASFORMANDO) },
                onFormandos = { navController.navigate(Routes.FORMANDOS) },
                onFormadores = { navController.navigate(Routes.FORMADORES) },
                onLogout = {
                    AuthSession.email = null
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(Routes.DASHBOARDFORMANDOS) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.DASHBOARDFORMADORES) {
            DashboardFormadoresScreen(
                onCursos = { navController.navigate(Routes.CURSOS) },
                onTurmas = { navController.navigate(Routes.TURMASFORMADOR) },
                onFormandos = { navController.navigate(Routes.FORMANDOS) },
                onFormadores = { navController.navigate(Routes.FORMADORES) },
                onSalas = { navController.navigate(Routes.DISPONIBILIDADE_SALAS) },
                onLogout = {
                    AuthSession.email = null
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(Routes.DASHBOARDFORMADORES) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.FORMADORES) {
            FormadoresScreen()
        }

        composable(Routes.DISPONIBILIDADE_SALAS) {
            DisponibilidadeSalasScreen()
        }

        composable(Routes.CURSOS) {
            CursosScreen()
        }

        composable(Routes.TURMASFORMANDO) {
            TurmasFormandosScreen(
                onCursos = { navController.navigate(Routes.CURSOS) },
                onAvaliacoes = { navController.navigate(Routes.AVALIACOES) },
                onTurmas = { navController.navigate(Routes.TURMASFORMANDO) },
                onFormandos = { navController.navigate(Routes.FORMANDOS) },
                onFormadores = { navController.navigate(Routes.FORMADORES) },
                onLogout = {
                    AuthSession.email = null
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(Routes.TURMASFORMANDO) { inclusive = true }
                    }
                }
            )
        }


        composable(Routes.AVALIACOES) {
            AvaliacoesScreen()
        }
        composable(Routes.TURMASFORMADOR) {
            TurmasFormadorScreen()
        }
    }
}