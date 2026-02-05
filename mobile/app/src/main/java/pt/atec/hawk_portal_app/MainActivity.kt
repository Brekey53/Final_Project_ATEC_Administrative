package pt.atec.hawk_portal_app

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import pt.atec.hawk_portal_app.ui.theme.Hawk_portal_appTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            Hawk_portal_appTheme {
                AppActivity()
            }
        }
    }
}

@Composable
fun AppActivity() {

    var email = remember { mutableStateOf("") }

    var password =  remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text("Hawk Portal")

        Spacer(modifier = Modifier.height(16.dp))

        TextField(
            value = email.value,
            onValueChange = {email.value = it},
            label = { Text("Email") }
        )

        Spacer(modifier = Modifier.height(10.dp))

        TextField(
            value = password.value,
            onValueChange = {password.value = it},
            label = { Text("Password") }

        )

        Button(onClick = {Log.d("demo1", "teste")}) {
            Text("Login")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun AppPreview() {
    AppActivity()
}
