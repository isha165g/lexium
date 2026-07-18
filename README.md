# Lexium

Lexium is a personal dictionary and AI-powered vocabulary builder. Enter any word, and Lexium generates a detailed, learner-friendly entry with definitions, parts of speech, synonyms, antonyms, and usage examples using the Google Gemini API.

If the Gemini service is unavailable or the API key is not configured, Lexium automatically falls back to the public [Free Dictionary API](https://dictionaryapi.dev/).

## 🌐 Live Demo

**Use Lexium instantly without any setup:**

👉 **https://lexium.isha165g.workers.dev/**

Simply open the website in your browser and start building your vocabulary.

---

## Features

- **AI-Powered Vocabulary Builder**: Generates rich definitions, synonyms, antonyms, and multiple example sentences using Gemini.
- **Smart Fallback**: Seamlessly falls back to standard dictionary data if the AI API is unavailable or rate-limited.
- **Watchlists**: Organize your words into custom lists (e.g., Starred, Academic, Topic-based).
- **Interactive Revision Cards**: Shuffle and revise words from your watchlists or by alphabet letter using interactive flashcards.
- **Backup & Restore**: Import and export your complete dictionary and watchlists as a single JSON file.
- **Beautiful Glassmorphic UI**: Elegant dark/light accents, smooth micro-animations, and a unified toast notification system.

---

## Getting Started

### Option 1: Use the Hosted Version (Recommended)

No installation is required. Visit:

**https://lexium.isha165g.workers.dev/**

Search for words, save them to watchlists, revise with flashcards, and back up your data directly from the web app.

---

### Option 2: Run Locally (For Developers)

Lexium is built as a serverless Cloudflare Workers application.

#### 1. Install Dependencies

Ensure you have [Node.js](https://nodejs.org/) installed, then run:

```bash
npm install
```

#### 2. Configure Local Environment

Get a Gemini API Key from [Google AI Studio](https://aistudio.google.com/).

Create a `.dev.vars` file in the project root (Wrangler uses `.dev.vars` for local environment secrets):

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
```

#### 3. Run Locally

```bash
npm run dev
```

Open:

```
http://127.0.0.1:8787
```