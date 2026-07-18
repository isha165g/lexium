import { generateWord } from "../api/lexiumApi.js";

import {
  normalizeWord,
  titleCase,
  createDetailedMeaning,
  createSimpleExamples,
} 
from "../shared/helper.js";

import { ERROR_MESSAGES } from "../shared/errors.js";

const DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en/";

export async function generateWordDetails(word) {
  try {
    return await fetchAiWordDetails(word);
  } catch (error) {
    console.warn("Gemini lookup failed, falling back to dictionary API.", error);
  }

  return fetchWordDetails(word);
}

async function fetchAiWordDetails(word) {
  const data = await generateWord(word);

  return {
    ...data,
    status: "new",
    updatedAt: Date.now()
  };
}

async function fetchWordDetails(word) {
  let response;
  try {
    response = await fetch(`${DICTIONARY_API}${encodeURIComponent(word)}`);
  } catch (error) {
    console.error("Fallback dictionary API request failed:", error);
    if (error.name === "TypeError" || !navigator.onLine) {
      throw new Error(ERROR_MESSAGES.NETWORK);
    }
    throw error;
  }

  if (!response.ok) {
    console.error(`Fallback dictionary API returned non-OK status (${response.status}) for "${word}"`);
    throw new Error(`No dictionary entry found for "${word}".`);
  }

  const data = await response.json();
  const firstEntry = Array.isArray(data) ? data[0] : null;
  const meanings = firstEntry?.meanings || [];
  const firstMeaning = meanings.find((meaning) => meaning.definitions?.length) || meanings[0];
  const firstDefinition = firstMeaning?.definitions?.find((definition) => definition.definition);

  if (!firstEntry || !firstMeaning || !firstDefinition) {
    throw new Error(`No usable definition found for "${word}".`);
  }

  const definitions = firstMeaning.definitions
    .map((definition) => definition.definition)
    .filter(Boolean)
    .slice(0, 3);
  const synonyms = [
    ...(firstMeaning.synonyms || []),
    ...firstMeaning.definitions.flatMap((definition) => definition.synonyms || [])
  ].filter(Boolean).slice(0, 4);
  const antonyms = [
    ...(firstMeaning.antonyms || []),
    ...firstMeaning.definitions.flatMap((definition) => definition.antonyms || [])
  ].filter(Boolean).slice(0, 4);
  const examples = meanings
    .flatMap((meaning) => meaning.definitions || [])
    .map((definition) => definition.example)
    .filter((example) => example && example.length <= 100)
    .slice(0, 3);
  const cleanWord = normalizeWord(firstEntry.word || word);
  const part = titleCase(firstMeaning.partOfSpeech || "");

  return {
    word: cleanWord,
    part,
    meaning: createDetailedMeaning(cleanWord, part, definitions, synonyms),
    examples: createSimpleExamples(cleanWord, part, examples),
    synonyms: [...new Set(synonyms.map(s => s.toLowerCase()))],
    antonyms: [...new Set(antonyms.map(a => a.toLowerCase()))],
    status: "new",
    updatedAt: Date.now()
  };
}