export function parseGeneratedEntry(text, fallbackWord) {
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