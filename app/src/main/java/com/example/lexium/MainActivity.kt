package com.example.lexium

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.example.lexium.navigation.AppNavigation
import com.example.lexium.ui.theme.LexiumTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            LexiumTheme {
                AppNavigation()
            }
        }
    }
}
