export function createId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `lexium-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeWord(word) {
  return word.trim().replace(/\s+/g, " ");
}

function tidySentence(value) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function lowercaseFirst(value) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function removeTerminalPunctuation(value) {
  return value.replace(/[.!?]+$/, "");
}

export function titleCase(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";
}

export function statusLabel(status) {
  if (status === "mastered") return "Remembered";
  if (status === "practice") return "Needs practice";
  return "New";
}

export function statusRank(status) {
  if (status === "practice") return 0;
  if (status === "new") return 1;
  return 2;
}

export function createDetailedMeaning(word, part, definitions, synonyms) {
  const cleanDefinitions = [...new Set(definitions.map((definition) => tidySentence(definition)))];
  const firstDefinition = cleanDefinitions[0] || `A word used in English.`;
  const extraDefinitions = cleanDefinitions.slice(1);
  const label = part ? `As a ${part.toLowerCase()}, ` : "";
  let meaning = `${label}"${word}" means ${lowercaseFirst(firstDefinition)}`;

  if (extraDefinitions.length) {
    meaning += ` It can also mean ${extraDefinitions.map((definition) => lowercaseFirst(removeTerminalPunctuation(definition))).join("; ")}.`;
  }

  if (synonyms.length) {
    meaning += ` Similar words: ${[...new Set(synonyms)].join(", ")}.`;
  }

  return meaning;
}

export function createSimpleExamples(word, part, apiExamples) {
  const cleanWord = normalizeWord(word).toLowerCase();
  const simpleApiExamples = apiExamples
    .map(tidySentence)
    .filter((example) => example.split(/\s+/).length <= 14)
    .slice(0, 2);
  const fallbackExamples = fallbackExamplesForPart(cleanWord, part);
  return [...new Set([...simpleApiExamples, ...fallbackExamples])].slice(0, 3);
}

function fallbackExamplesForPart(word, part) {
  const normalizedPart = part.toLowerCase();
  if (normalizedPart === "verb") {
    return [
      `I will ${word} it today.`,
      `Please ${word} this carefully.`,
      `They ${word} when they need to.`
    ];
  }

  if (normalizedPart === "adjective") {
    return [
      `The story was ${word}.`,
      `It felt very ${word}.`,
      `She gave a ${word} answer.`
    ];
  }

  if (normalizedPart === "adverb") {
    return [
      `She spoke ${word}.`,
      `He walked ${word}.`,
      `They worked ${word}.`
    ];
  }

  return [
    `This is an example of ${word}.`,
    `I learned the word ${word} today.`,
    `The teacher explained ${word} in class.`
  ];
}