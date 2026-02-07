package pt.atec.hawk_portal_app

import FormadoresScreen
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import pt.atec.hawk_portal_app.ui.screens.dashboard.DashboardScreen
import pt.atec.hawk_portal_app.ui.screens.login.LoginScreen


object Routes {
    const val LOGIN = "login"
    const val DASHBOARD = "dashboard"
    const val CURSOS = "cursos"
    const val FORMADORES = "formadores"
    const val FORMANDOS = "formandos"
    const val DISPONIBILIDADE_SALAS = "disponibilidade-salas"
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    AppNavigation()
                }
        }
    }
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = Routes.LOGIN) {
        composable(Routes.LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                }
            )
        }
        composable(Routes.DASHBOARD) {
            DashboardScreen(
                onCursos = { navController.navigate(Routes.CURSOS) },
                onFormandos = { navController.navigate(Routes.FORMANDOS) },
                onFormadores = { navController.navigate(Routes.FORMADORES) },
                onSalas = { navController.navigate(Routes.DISPONIBILIDADE_SALAS) },
                onLogout = { /* logout */ }
            )
        }

        composable(Routes.FORMADORES) {
            FormadoresScreen()
        }
    }
}