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
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.lexium.viewmodel.VocabViewModel
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.AssistChip
import com.example.lexium.ai.GeminiService

// ---------------- HELPERS ----------------

fun findSentence(text: String, word: String): String {
    val sentences = text.split(Regex("[.!?]"))
    return sentences.find { it.contains(word, ignoreCase = true) }?.trim() ?: ""
}

fun getMeaning(word: String): String {
    return when (word.lowercase()) {
        "tenuous" -> "Very weak or slight; lacking strength"
        else -> "Meaning not found"
    }
}

fun getSynonyms(word: String): List<String> {
    return when (word.lowercase()) {
        "tenuous" -> listOf("weak", "flimsy", "slender")
        else -> emptyList()
    }
}

// ---------------- MAIN SCREEN ----------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OCRScreen() {

    val context = LocalContext.current
    val geminiService = remember { GeminiService() }

    var extractedText by remember { mutableStateOf("") }
    var selectedWordIndex by remember { mutableIntStateOf(-1) }
    var selectedWord by remember { mutableStateOf("") }
    var selectedSentence by remember { mutableStateOf("") }
    var showSheet by remember { mutableStateOf(false) }

    val vocabViewModel: VocabViewModel = viewModel()

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

                addStringAnnotation(
                    tag = "WORD",
                    annotation = index.toString(),
                    start = start,
                    end = end
                )

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

                        val words = extractedText.split("\\s+".toRegex())
                        val word = words.getOrNull(index) ?: ""

                        val sentence = findSentence(extractedText, word)

                        selectedWord = word
                        selectedSentence = sentence
                        showSheet = true
                    }
                }
            )
        }

        // ---------------- BOTTOM SHEET ----------------

        if (showSheet) {
            ModalBottomSheet(
                onDismissRequest = { showSheet = false }
            ) {

                val meaning = remember(selectedWord) { getMeaning(selectedWord) }
                val synonyms = remember(selectedWord) { getSynonyms(selectedWord) }

                var aiResponse by remember { mutableStateOf("Loading...") }

                LaunchedEffect(selectedWord, selectedSentence) {
                    aiResponse = "Loading..."

                    geminiService.getMeaning(selectedWord, selectedSentence) { result ->
                        aiResponse = result
                    }
                }

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {

                    Text(
                        text = selectedWord,
                        style = MaterialTheme.typography.headlineLarge
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Dictionary Meaning
                    Text("Definition", style = MaterialTheme.typography.labelMedium)
                    Text(text = meaning)

                    Spacer(modifier = Modifier.height(12.dp))

                    // AI Meaning
                    Text("AI Explanation", style = MaterialTheme.typography.labelMedium)

                    if (aiResponse == "Loading...") {
                        CircularProgressIndicator()
                    } else {
                        aiResponse.split("\n").forEach {
                            Text(text = it)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Synonyms
                    Text("Synonyms", style = MaterialTheme.typography.labelMedium)

                    Row {
                        synonyms.forEach { syn ->
                            AssistChip(
                                onClick = {},
                                label = { Text(syn) },
                                modifier = Modifier.padding(end = 6.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = {
                            vocabViewModel.saveWord(
                                word = selectedWord,
                                meaning = meaning,
                                sentence = selectedSentence
                            )
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Capture Word 📚")
                    }
                }
            }
        }
    }
}