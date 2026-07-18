# Lexium

Lexium is a personal dictionary and AI-powered vocabulary builder. Enter any word, and Lexium generates a detailed, learner-friendly entry with definitions, parts of speech, synonyms, antonyms, and usage examples using the Google Gemini API.

If the Gemini service is unavailable or the API key is not configured, Lexium automatically falls back to the public [Free Dictionary API](https://dictionaryapi.dev/).

---
## Features
- **AI-Powered Vocabulary Builder**: Generates rich definitions, synonyms, antonyms, and multiple example sentences using Gemini.
- **Smart Fallback**: Seamless fallback to standard dictionary data if the AI API limit is hit or unavailable.
- **Watchlists**: Organize your words into custom lists (e.g., Starred, Academic, Topic-based).
- **Interactive Revision Cards**: Shuffle and revise words in your watchlists or by alphabet letter using interactive flashcards.
- **Backup & Restore**: Easily import and export your complete dictionary and watchlists as a single JSON file.
- **Beautiful Glassmorphic UI**: Elegant dark/light accents, dynamic micro-animations, and a unified toast notification banner system.
---
## Local Setup & Development
Lexium is built as a serverless Cloudflare Workers site.
### 1. Install Dependencies
Ensure you have [Node.js](https://nodejs.org/) installed, then run:
```bash
npm install
```
### 2. Configure Local Environment
Get a Gemini API Key from [Google AI Studio](https://aistudio.google.com/). 
Create a `.dev.vars` file in the project root folder (Wrangler uses `.dev.vars` for local environment secrets):
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
```

### 3. Run Locally
Start the local development server:
```bash
npm run dev
```
Open [http://127.0.0.1:8787](http://127.0.0.1:8787) in your browser.

---
## Deployment to Cloudflare
Deploying Lexium to Cloudflare Workers is fast and easy.

### 1. Log In to Cloudflare
Authenticate wrangler with your Cloudflare account:
```bash
npx wrangler login
```

### 2. Set Up Secrets
Add your production Gemini API key to your Cloudflare Worker environment:
```bash
npx wrangler secret put GEMINI_API_KEY
```
*(Optional)* If you want to specify a different model for production, add it to your configuration.

### 3. Deploy the App
Upload the serverless backend worker and public static assets:
```bash
npm run deploy
```
Once completed, wrangler will output the public URL of your deployed Lexium application.