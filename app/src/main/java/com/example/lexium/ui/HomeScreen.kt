package com.example.lexium.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.MenuBook,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Lexium",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontStyle = FontStyle.Italic,
                                fontWeight = FontWeight.Bold
                            ),
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                },
                actions = {
                    Button(
                        onClick = { navController.navigate("ocr") },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color.Transparent
                        ),
                        contentPadding = PaddingValues(0.dp),
                        modifier = Modifier
                            .padding(end = 16.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(
                                        MaterialTheme.colorScheme.primary,
                                        MaterialTheme.colorScheme.primaryContainer
                                    )
                                )
                            )
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Text(
                            "Start Your Mastery",
                            style = MaterialTheme.typography.labelMedium,
                            color = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background.copy(alpha = 0.85f)
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Hero Section
            item {
                HeroSection(
                    onStartClick = { navController.navigate("ocr") },
                    onVocabClick = { navController.navigate("vocab") }
                )
            }

            // Artifact Card Section
            item {
                ArtifactSection()
            }

            // Precision Engineering Section
            item {
                PrecisionEngineeringSection(onOCRClick = { navController.navigate("ocr") })
            }

            // Footer
            item {
                Footer()
            }
        }
    }
}

@Composable
fun HeroSection(onStartClick: () -> Unit, onVocabClick: () -> Unit) {
    Column(
        modifier = Modifier
            .padding(horizontal = 24.dp, vertical = 48.dp)
            .fillMaxWidth()
    ) {
        Text(
            text = "THE DIGITAL CURATOR",
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.tertiary,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        Text(
            text = buildAnnotatedString {
                append("Lexium: Where ")
                withStyle(
                    SpanStyle(
                        fontStyle = FontStyle.Italic,
                        color = MaterialTheme.colorScheme.tertiary
                    )
                ) {
                    append("vocabulary")
                }
                append(" meets victory.")
            },
            style = MaterialTheme.typography.headlineLarge.copy(
                fontSize = 48.sp,
                lineHeight = 52.sp
            ),
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        Text(
            text = "The high-performance vocabulary builder for GRE candidates. Transform reading into retention through editorial precision.",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 48.dp)
        )

        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Button(
                onClick = onStartClick,
                shape = RoundedCornerShape(4.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(64.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(
                        Brush.linearGradient(
                            colors = listOf(
                                MaterialTheme.colorScheme.primary,
                                MaterialTheme.colorScheme.primaryContainer
                            )
                        )
                    ),
                colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Start Your Mastery", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null)
                }
            }

            Button(
                onClick = onVocabClick,
                shape = RoundedCornerShape(4.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFF6F3F2),
                    contentColor = MaterialTheme.colorScheme.primary
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(64.dp)
                    .border(1.dp, Color(0x1A000000), RoundedCornerShape(4.dp))
            ) {
                Text("View Vocabulary", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
        }
    }
}

@Composable
fun ArtifactSection() {
    Column(
        modifier = Modifier
            .background(Color(0xFFF6F3F2))
            .padding(vertical = 64.dp, horizontal = 24.dp)
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier.padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "WORD OF THE MOMENT",
                    style = MaterialTheme.typography.labelLarge.copy(
                        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.4f),
                        letterSpacing = 2.sp
                    )
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Perspicacious",
                    style = MaterialTheme.typography.headlineLarge.copy(fontSize = 36.sp),
                    color = MaterialTheme.colorScheme.primary,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "/ˌpər-spə-ˈkā-shəs/",
                    style = MaterialTheme.typography.bodyMedium,
                    fontStyle = FontStyle.Italic,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(24.dp))
                HorizontalDivider(modifier = Modifier.width(48.dp), thickness = 1.dp, color = MaterialTheme.colorScheme.tertiary.copy(alpha = 0.2f))
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    text = "Having a ready insight into and understanding of things.",
                    style = MaterialTheme.typography.bodyLarge,
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }

        Spacer(modifier = Modifier.height(48.dp))

        Text(
            text = "Mastery is not memorization. It is architecture.",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Our platform treats every lexeme as a precious artifact. We don't just show you words; we build the neural pathways required to deploy them under pressure.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(24.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                Icons.Default.CheckCircle,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.tertiary,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "LEVEL 4 MASTERY ACHIEVED",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.tertiary
            )
        }
    }
}

@Composable
fun PrecisionEngineeringSection(onOCRClick: () -> Unit) {
    Column(
        modifier = Modifier
            .padding(vertical = 64.dp, horizontal = 24.dp)
    ) {
        Text(
            text = "Precision Engineering",
            style = MaterialTheme.typography.headlineLarge,
            color = MaterialTheme.colorScheme.primary
        )
        Text(
            text = "Advanced tools for the modern scholar.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        Spacer(modifier = Modifier.height(32.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = BorderStroke(1.dp, Color(0x1A000000))
        ) {
            Column(modifier = Modifier.padding(32.dp)) {
                Icon(
                    Icons.Default.PhotoCamera,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(36.dp)
                )
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    text = "OCR Text Capture",
                    style = MaterialTheme.typography.headlineMedium.copy(fontSize = 24.sp),
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Point your device at any scholarly text. Lexium instantly extracts complex vocabulary and creates rich, contextual study units.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(32.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    LinearProgressIndicator(
                        progress = { 0.98f },
                        modifier = Modifier
                            .weight(1f)
                            .height(6.dp)
                            .clip(CircleShape),
                        color = MaterialTheme.colorScheme.primary,
                        trackColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.1f)
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Text(
                        text = "98% Accuracy",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = onOCRClick,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(4.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Text("Launch OCR Capture")
                }
            }
        }
    }
}

@Composable
fun Footer() {
    Column(
        modifier = Modifier
            .background(Color(0xFF1C1B1B))
            .padding(48.dp)
            .fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Lexium",
            style = MaterialTheme.typography.headlineMedium.copy(
                fontStyle = FontStyle.Italic,
                color = Color(0xFFFCF9F8)
            )
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "© 2026 LEXIUM. THE DIGITAL CURATOR.",
            style = MaterialTheme.typography.labelSmall,
            color = Color(0xFFFCF9F8).copy(alpha = 0.5f)
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            Text("PHILOSOPHY", style = MaterialTheme.typography.labelSmall, color = Color(0xFFFCF9F8).copy(alpha = 0.5f))
            Text("FEATURES", style = MaterialTheme.typography.labelSmall, color = Color(0xFFFCF9F8).copy(alpha = 0.5f))
        }
        Spacer(modifier = Modifier.height(16.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            Text("SCHOLARLY ACCESS", style = MaterialTheme.typography.labelSmall, color = Color(0xFFE9C349))
            Text("PRIVACY", style = MaterialTheme.typography.labelSmall, color = Color(0xFFFCF9F8).copy(alpha = 0.5f))
        }

        Spacer(modifier = Modifier.height(32.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            FooterIcon(Icons.Default.Language)
            FooterIcon(Icons.Default.Share)
        }
    }
}

@Composable
fun FooterIcon(icon: ImageVector) {
    Box(
        modifier = Modifier
            .size(40.dp)
            .border(1.dp, Color(0xFFFCF9F8).copy(alpha = 0.1f), CircleShape)
            .padding(8.dp),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Color(0xFFFCF9F8).copy(alpha = 0.5f),
            modifier = Modifier.size(20.dp)
        )
    }
}
