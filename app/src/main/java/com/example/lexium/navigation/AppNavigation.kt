package com.example.lexium.navigation

import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.*
import com.example.lexium.ui.auth.LoginScreen
import com.example.lexium.ui.auth.RegisterScreen
import com.example.lexium.viewmodel.AuthViewModel
import com.example.lexium.ui.HomeScreen
import com.example.lexium.ui.OCRScreen

@Composable
fun AppNavigation() {

    val navController = rememberNavController()
    val viewModel: AuthViewModel = viewModel()

    NavHost(
        navController = navController,
        startDestination = "login"
    ) {

        composable("login") {
            LoginScreen(
                viewModel = viewModel,
                onLoginSuccess = {
                    navController.navigate("home")
                },
                onRegisterClick = {
                    navController.navigate("register")
                }
            )
        }

        composable("register") {
            RegisterScreen(
                viewModel = viewModel,
                onBackClick = {
                    navController.popBackStack()
                }
            )
        }

        composable("home") {
            HomeScreen(navController)
        }

        composable("ocr") {
            OCRScreen()
        }
    }
}