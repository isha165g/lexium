import { buildVocabularyPrompt } from "./prompts.js";
import { parseGeneratedEntry } from "./parser.js";

export async function generateWord(word, env) {
  if (!env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing.");
  }

  const model = env.GEMINI_MODEL || "gemini-3.1-flash-lite";

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildVocabularyPrompt(word)
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 700,
        responseMimeType: "application/json"
      }
    })
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Failed to read Gemini response.");
  }

  if (!response.ok) {
    const message =
      data?.error?.message ||
      "Gemini request failed.";

    throw new Error(message);
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("\n")
      .trim();

  return parseGeneratedEntry(text, word);
}