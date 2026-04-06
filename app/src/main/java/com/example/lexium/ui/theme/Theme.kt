package com.example.lexium.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = LexiumPrimary,
    onPrimary = LexiumOnPrimary,
    primaryContainer = LexiumPrimaryContainer,
    secondary = LexiumSecondary,
    onSecondary = LexiumOnPrimary,
    secondaryContainer = LexiumSecondaryContainer,
    tertiary = LexiumTertiary,
    onTertiary = LexiumOnPrimary,
    tertiaryContainer = LexiumTertiaryContainer,
    background = LexiumOnBackground, // Dark mode background
    onBackground = LexiumBackground,
    surface = LexiumOnBackground,
    onSurface = LexiumBackground,
    surfaceVariant = LexiumOnSurfaceVariant,
    onSurfaceVariant = LexiumSurfaceVariant,
    outline = LexiumOutline,
    outlineVariant = LexiumOutlineVariant,
    error = LexiumError,
    onError = LexiumOnError
)

private val LightColorScheme = lightColorScheme(
    primary = LexiumPrimary,
    onPrimary = LexiumOnPrimary,
    primaryContainer = LexiumPrimaryContainer,
    secondary = LexiumSecondary,
    onSecondary = LexiumOnPrimary,
    secondaryContainer = LexiumSecondaryContainer,
    tertiary = LexiumTertiary,
    onTertiary = LexiumOnPrimary,
    tertiaryContainer = LexiumTertiaryContainer,
    background = LexiumBackground,
    onBackground = LexiumOnBackground,
    surface = LexiumSurface,
    onSurface = LexiumOnSurface,
    surfaceVariant = LexiumSurfaceVariant,
    onSurfaceVariant = LexiumOnSurfaceVariant,
    outline = LexiumOutline,
    outlineVariant = LexiumOutlineVariant,
    error = LexiumError,
    onError = LexiumOnError
)

@Composable
fun LexiumTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
