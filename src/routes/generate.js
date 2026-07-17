import { generateWord } from "../gemini.js";
import { json, error } from "../utils.js";

export async function generate(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON request.", 400);
  }

  const word = String(body.word || "").trim();

  if (!word) {
    return error("Enter a word first.", 400);
  }

  const entry = await generateWord(word, env);

  return json(entry);
}