package com.example.lexium.ui

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.text.ClickableText
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions

@Composable
fun OCRScreen() {

    val context = LocalContext.current
    var extractedText by remember { mutableStateOf("") }
    var selectedWordIndex by remember { mutableStateOf(-1) }
    var selectedWord by remember { mutableStateOf("") }

    val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->

        uri?.let {
            val image = InputImage.fromFilePath(context, uri)

            recognizer.process(image)
                .addOnSuccessListener { visionText ->
                    extractedText = visionText.text
                    selectedWordIndex = -1
                    selectedWord = ""
                }
                .addOnFailureListener {
                    extractedText = "Error reading text"
                }
        }
    }

    val annotatedText = remember(extractedText, selectedWordIndex) {
        buildAnnotatedString {

            val words = extractedText.split("\\s+".toRegex())

            words.forEachIndexed { index, word ->

                val start = length

                append(word)

                val end = length

                // Tag each word with index
                addStringAnnotation(
                    tag = "WORD",
                    annotation = index.toString(),
                    start = start,
                    end = end
                )

                // Highlight ONLY selected index
                if (index == selectedWordIndex) {
                    addStyle(
                        style = SpanStyle(
                            background = Color.Yellow
                        ),
                        start = start,
                        end = end
                    )
                }

                append(" ")
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {

        Button(onClick = {
            launcher.launch("image/*")
        }) {
            Text("Upload Image")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Extracted Text:",
            style = MaterialTheme.typography.titleMedium
        )

        Spacer(modifier = Modifier.height(8.dp))

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
        ) {

            ClickableText(
                text = annotatedText,
                style = MaterialTheme.typography.bodyLarge.copy(
                    lineHeight = MaterialTheme.typography.bodyLarge.lineHeight * 1.4
                ),
                onClick = { offset ->

                    annotatedText.getStringAnnotations(
                        tag = "WORD",
                        start = offset,
                        end = offset
                    ).firstOrNull()?.let { annotation ->
                        val index = annotation.item.toInt()
                        selectedWordIndex = index

                        // Update selected word text
                        val words = extractedText.split("\\s+".toRegex())
                        selectedWord = words.getOrNull(index) ?: ""
                    }
                }
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Selected Word: $selectedWord",
            style = MaterialTheme.typography.bodyLarge
        )
    }
}

