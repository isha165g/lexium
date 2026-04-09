package com.example.lexium.ai

import com.example.lexium.BuildConfig
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import org.json.JSONObject
import java.io.IOException
import android.os.Handler
import android.os.Looper
import okhttp3.RequestBody.Companion.toRequestBody

class GeminiService {

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .readTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
        .writeTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
        .build()

    private val API_KEY = BuildConfig.GEMINI_API_KEY

    fun getMeaning(
        word: String,
        sentence: String,
        onResult: (String) -> Unit
    ) {

        val prompt = """
            Explain the word "$word" in the context of this sentence:
            "$sentence"
            
            Give response in STRICT format:

            Meaning: <meaning>
            Context: <explanation using given sentence>
            Synonyms: <comma separated words>
            
            Keep it short.
        """.trimIndent()

        val part = JSONObject()
        part.put("text", prompt)

        val partsArray = org.json.JSONArray()
        partsArray.put(part)

        val content = JSONObject()
        content.put("parts", partsArray)

        val contentsArray = org.json.JSONArray()
        contentsArray.put(content)

        val json = JSONObject()
        json.put("contents", contentsArray)

        println("REQUEST JSON: ${json.toString(2)}")

        val body = json.toString()
            .toRequestBody("application/json".toMediaTypeOrNull())

        val request = Request.Builder()
            .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=$API_KEY")
            .post(body)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Handler(Looper.getMainLooper()).post {
                    onResult("Network error: ${e.message}")
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val responseBody = response.body?.string()
                println("RAW RESPONSE: $responseBody")

                try {
                    val json = JSONObject(responseBody ?: "")

                    // 🔥 HANDLE API ERRORS FIRST
                    if (json.has("error")) {
                        val errorMsg = json.getJSONObject("error").getString("message")
                        Handler(Looper.getMainLooper()).post {
                            onResult("API Error: $errorMsg")
                        }
                        return
                    }

                    if (json.has("candidates")) {
                        val candidates = json.getJSONArray("candidates")

                        if (candidates.length() > 0) {
                            val text = candidates
                                .getJSONObject(0)
                                .getJSONObject("content")
                                .getJSONArray("parts")
                                .getJSONObject(0)
                                .getString("text")

                            Handler(Looper.getMainLooper()).post {
                                onResult(text)
                            }
                            return
                        }
                    }

                    Handler(Looper.getMainLooper()).post {
                        onResult("No AI response received")
                    }

                } catch (e: Exception) {
                    Handler(Looper.getMainLooper()).post {
                        onResult("Error parsing response: ${e.message}")
                    }
                }
            }
        })
    }
}