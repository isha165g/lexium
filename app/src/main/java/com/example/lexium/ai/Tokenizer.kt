package com.example.lexium.ai

import android.content.Context

class Tokenizer(context: Context) {

    private val vocab: Map<String, Int>

    init {
        val vocabList = context.assets.open("vocab.txt")
            .bufferedReader()
            .readLines()

        vocab = vocabList.mapIndexed { index, token ->
            token to index
        }.toMap()
    }

    fun tokenize(text: String): List<String> {
        return text.lowercase()
            .replace(Regex("[^a-zA-Z ]"), "")
            .split(" ")
    }

    fun convertTokensToIds(tokens: List<String>): List<Int> {
        return tokens.map { token ->
            vocab[token] ?: vocab["[UNK]"]!!
        }
    }

    fun encode(text: String): IntArray {
        val tokens = tokenize(text)

        val inputTokens = mutableListOf<String>()
        inputTokens.add("[CLS]")
        inputTokens.addAll(tokens)
        inputTokens.add("[SEP]")

        val ids = convertTokensToIds(inputTokens)

        return ids.toIntArray()
    }
}