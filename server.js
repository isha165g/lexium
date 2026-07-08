const http = require("http");
const fs = require("fs");
const path = require("path");

const envInfo = loadDotEnv();

const PORT = Number(process.env.PORT || 4173);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const root = __dirname;
const resolvedRoot = path.resolve(root);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "POST" && request.url === "/api/generate") {
      await handleGenerate(request, response);
      return;
    }

    if (request.method === "GET" && request.url === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        hasGeminiKey: Boolean(GEMINI_API_KEY),
        keySource: envInfo.loadedKeys.includes("GEMINI_API_KEY") ? ".env" : "system environment",
        hasEnvFile: envInfo.hasEnvFile,
        model: GEMINI_MODEL
      });
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    serveStatic(request, response);
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Lexium is running at http://localhost:${PORT}`);
});

async function handleGenerate(request, response) {
  if (!GEMINI_API_KEY) {
    sendJson(response, 503, {
      error: "Gemini API key is missing. Add GEMINI_API_KEY to a .env file, then restart the server."
    });
    return;
  }

  const body = await readJsonBody(request);
  const word = normalizeWord(String(body.word || ""));

  if (!word) {
    sendJson(response, 400, { error: "Enter a word first." });
    return;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const geminiResponse = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: buildVocabularyPrompt(word) }]
        }
      ],
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 700,
        responseMimeType: "application/json"
      }
    })
  });

  const geminiData = await geminiResponse.json();

  if (!geminiResponse.ok) {
    const message = geminiData?.error?.message || "Gemini request failed.";
    sendJson(response, geminiResponse.status, { error: message });
    return;
  }

  const text = geminiData?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();
  const entry = parseGeneratedEntry(text, word);
  sendJson(response, 200, entry);
}

function parseGeneratedEntry(text, fallbackWord) {
  if (!text) throw new Error("Gemini returned an empty response.");

  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const data = JSON.parse(cleaned);

  if (!data.word || !data.meaning || !Array.isArray(data.examples)) {
    throw new Error("Gemini returned an incomplete vocabulary entry.");
  }

  return {
    word: normalizeWord(data.word || fallbackWord),
    part: titleCase(String(data.part || "Word")),
    meaning: String(data.meaning).trim(),
    examples: data.examples.map((example) => tidySentence(String(example))).filter(Boolean).slice(0, 4),
    synonyms: Array.isArray(data.synonyms) ? data.synonyms.map((syn) => String(syn).trim().toLowerCase()).filter(Boolean).slice(0, 4) : [],
    antonyms: Array.isArray(data.antonyms) ? data.antonyms.map((ant) => String(ant).trim().toLowerCase()).filter(Boolean).slice(0, 4) : []
  };
}

function buildVocabularyPrompt(word) {
  return `Create a vocabulary-builder entry for the English word "${word}".

Return only valid JSON with this exact shape:
{
  "word": "correct lowercase word",
  "part": "Noun | Verb | Adjective | Adverb | Phrase | Word",
  "meaning": "Detailed learner-friendly meaning.",
  "examples": [
    "Simple example sentence 1.",
    "Simple example sentence 2.",
    "Simple example sentence 3.",
    "Simple example sentence 4."
  ],
  "synonyms": [
    "synonym 1",
    "synonym 2",
    "synonym 3"
  ],
  "antonyms": [
    "antonym 1",
    "antonym 2",
    "antonym 3"
  ]
}

Meaning rules:
- Write 3 to 5 short sentences.
- Explain the common meaning first.
- Add useful nuance, common context, or emotion if relevant.
- Use plain English for a school student or English learner.
- Avoid circular definitions.

Example rules:
- Sentences must be short, natural, and easy.
- Each sentence must contain the word or a close grammatical form.
- Use everyday situations.
- Do not use difficult words in the examples.

Synonyms and Antonyms rules:
- Provide 2 to 4 high-quality synonyms and antonyms related to the context of the definition.
- Keep them single words or short common phrases in lowercase.
- If there are no clear antonyms or synonyms (e.g. for some highly abstract words or function words), return an empty array [].`;
}

function serveStatic(request, response) {
  const requestPath = decodeURIComponent(new URL(request.url, `http://localhost:${PORT}`).pathname);
  const safePath = path.normalize(requestPath).replace(/^[/\\]+/, "").replace(/^(\.\.[/\\])+/, "");
  const staticPath = !safePath || safePath === "." ? "index.html" : safePath;
  const filePath = path.resolve(root, staticPath);

  if (!filePath.startsWith(resolvedRoot)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const type = mimeTypes[path.extname(filePath)] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": type });
    if (request.method === "HEAD") response.end();
    else response.end(content);
  });
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10000) {
        request.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Invalid JSON request."));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function loadDotEnv() {
  const envPath = path.join(__dirname, ".env");
  const result = { hasEnvFile: fs.existsSync(envPath), loadedKeys: [] };
  if (!result.hasEnvFile) return result;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separator = trimmed.indexOf("=");
    if (separator === -1) return;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (key) {
      process.env[key] = value;
      result.loadedKeys.push(key);
    }
  });

  return result;
}

function normalizeWord(word) {
  return word.trim().replace(/\s+/g, " ");
}

function titleCase(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";
}

function tidySentence(value) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}
