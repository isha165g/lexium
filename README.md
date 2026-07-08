# Lexium

Lexium is a personal dictionary and vocabulary builder. Enter one word, and Gemini generates a detailed learner-friendly meaning plus simple example sentences.

## Setup

1. Get a Gemini API key from Google AI Studio.
2. Copy `.env.example` to `.env`.
3. Put your key in `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=4173
```

## Run

```bash
npm start
```

Open:

```text
http://localhost:4173
```

The browser app calls the local backend at `/api/generate`, so your Gemini key stays on your computer and is not exposed in frontend code.

If Gemini is unavailable or the key is missing, Lexium falls back to the free dictionary API.
