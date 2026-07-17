import { generateWord } from "./gemini.js";
import { json, error } from "./utils.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      // -----------------------------
      // GET /api/health
      // -----------------------------
      if (request.method === "GET" && url.pathname === "/api/health") {
        return json({
          ok: true,
          hasGeminiKey: Boolean(env.GEMINI_API_KEY),
          model: env.GEMINI_MODEL || "gemini-3.1-flash-lite"
        });
      }

      // -----------------------------
      // POST /api/generate
      // -----------------------------
      if (
        request.method === "POST" &&
        url.pathname === "/api/generate"
      ) {
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

      // -----------------------------
      // Unknown API Route
      // -----------------------------
      if (url.pathname.startsWith("/api/")) {
        return error("Endpoint not found.", 404);
      }

      // Let Cloudflare Assets serve everything else
      return env.ASSETS.fetch(request);

    } catch (err) {
      console.error(err);

      return error(
        err instanceof Error
          ? err.message
          : "Internal server error.",
        500
      );
    }
  }
};