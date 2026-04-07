package com.example.lexium.ai

import android.content.Context
import ai.onnxruntime.*
import kotlin.math.sqrt

class AIEngine(context: Context) {

    private val env = OrtEnvironment.getEnvironment()
    private val session: OrtSession
    private val tokenizer = Tokenizer(context)

    init {
        val modelBytes = context.assets.open("minilm.onnx").readBytes()
        session = env.createSession(modelBytes)
    }

    // 🔥 MAIN FUNCTION (USED BY UI)
    fun runModel(text: String): String {
        val embedding = getEmbedding(text)
        return interpretEmbedding(embedding)
    }

    // ✅ SINGLE, CONSISTENT EMBEDDING PIPELINE
    private fun getEmbedding(text: String): FloatArray {

        val inputIds = tokenizer.encode(text)
        val seqLength = inputIds.size

        val inputIdsLong = LongArray(seqLength) { inputIds[it].toLong() }
        val attentionMask = LongArray(seqLength) { 1L }
        val tokenTypeIds = LongArray(seqLength) { 0L }

        val shape = longArrayOf(1, seqLength.toLong())

        val inputIdsTensor = OnnxTensor.createTensor(
            env,
            java.nio.LongBuffer.wrap(inputIdsLong),
            shape
        )

        val attentionMaskTensor = OnnxTensor.createTensor(
            env,
            java.nio.LongBuffer.wrap(attentionMask),
            shape
        )

        val tokenTypeTensor = OnnxTensor.createTensor(
            env,
            java.nio.LongBuffer.wrap(tokenTypeIds),
            shape
        )

        val inputs = mapOf(
            "input_ids" to inputIdsTensor,
            "attention_mask" to attentionMaskTensor,
            "token_type_ids" to tokenTypeTensor
        )

        val result = session.run(inputs)
        val output = result[0].value as Array<Array<FloatArray>>
        val embeddings = output[0]

        // Optional cleanup (good practice)
        inputIdsTensor.close()
        attentionMaskTensor.close()
        tokenTypeTensor.close()
        result.close()

        return embeddings[0]
    }

    // 🚀 CACHE reference embeddings (VERY IMPORTANT for performance)
    private val weakVec by lazy {
        getEmbedding("weak fragile lacking strength")
    }

    private val strongVec by lazy {
        getEmbedding("strong powerful stable solid")
    }

    private val temporaryVec by lazy {
        getEmbedding("temporary short-lived fleeting ephemeral")
    }

    // 🧠 Convert embedding → meaning
    private fun interpretEmbedding(embedding: FloatArray): String {

        val weakScore = cosineSimilarity(embedding, weakVec)
        val strongScore = cosineSimilarity(embedding, strongVec)
        val tempScore = cosineSimilarity(embedding, temporaryVec)

        return when {
            weakScore > strongScore && weakScore > tempScore ->
                "This word suggests something weak, fragile, or lacking strength in this context."

            strongScore > weakScore && strongScore > tempScore ->
                "This word implies strength, stability, or intensity in this sentence."

            tempScore > weakScore && tempScore > strongScore ->
                "This word refers to something temporary or short-lived."

            else ->
                "This word’s meaning depends on context, but it carries a neutral tone here."
        }
    }

    // 📐 Cosine similarity
    private fun cosineSimilarity(a: FloatArray, b: FloatArray): Float {
        var dot = 0f
        var normA = 0f
        var normB = 0f

        for (i in a.indices) {
            dot += a[i] * b[i]
            normA += a[i] * a[i]
            normB += b[i] * b[i]
        }

        return (dot / (sqrt(normA) * sqrt(normB)))
    }

    // 🧾 Build query (used by UI)
    fun buildQuery(word: String, sentence: String): String {
        return "$word in context: $sentence"
    }
}