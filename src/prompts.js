export function buildVocabularyPrompt(word) {
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
