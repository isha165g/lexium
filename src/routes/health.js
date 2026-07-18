import { json } from "../utils.js";

export async function health(request, env) {
  return json({
    ok: true,
    hasGeminiKey: Boolean(env.GEMINI_API_KEY),
    model: env.GEMINI_MODEL || "gemini-3.1-flash-lite"
  });
}