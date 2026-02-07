import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import pt.atec.hawk_portal_app.model.Formador
import pt.atec.hawk_portal_app.states.FormadoresViewModel
import coil.compose.AsyncImage
import pt.atec.hawk_portal_app.R


@Composable
fun FormadoresScreen(
    viewModel: FormadoresViewModel = viewModel()
) {
    if (viewModel.isLoading.value) {
        Text("A carregar formadores...")
    } else {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            items(viewModel.formadores.value) { formador ->
                FormadorItem(formador)
            }
        }
    }
}

@Composable
fun FormadorItem(formador: Formador) {

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(12.dp)
    ) {

        // FOTO DO FORMADOR
        AsyncImage(
            model = formador.fotoUrl,
            contentDescription = "Foto do formador",
            modifier = Modifier
                .size(64.dp)
                .clip(CircleShape),
            placeholder = painterResource(R.drawable.ic_user_placeholder),
            error = painterResource(R.drawable.ic_user_placeholder)
        )

        Spacer(modifier = Modifier.width(12.dp))

        // DADOS
        Column {
            Text(text = formador.nome ?: "Nome não disponível")
            Text(text = formador.email ?: "-")
            Text(text = formador.qualificacoes ?: "")
        }
    }
}

