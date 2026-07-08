const STORAGE_KEY = "lexium.dictionary.v1";
const WATCHLISTS_STORAGE_KEY = "lexium.watchlists.v1";
const DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function createId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `lexium-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const sampleEntries = [
  {
    id: createId(),
    word: "serendipity",
    part: "Noun",
    meaning: "A pleasant discovery made by chance.",
    examples: [
      "Finding the exact book I needed in a street stall was serendipity.",
      "Their collaboration began through pure serendipity."
    ],
    synonyms: ["luck", "chance", "coincidence", "fluke"],
    antonyms: ["design", "planning", "misfortune", "bad luck"],
    status: "practice",
    createdAt: Date.now() - 400000,
    updatedAt: Date.now() - 300000
  },
  {
    id: createId(),
    word: "lucid",
    part: "Adjective",
    meaning: "Clear, easy to understand, or mentally sharp.",
    examples: [
      "Her explanation was lucid enough for everyone in the room.",
      "He remained lucid despite the pressure."
    ],
    synonyms: ["clear", "coherent", "understandable", "transparent"],
    antonyms: ["confused", "vague", "unclear", "opaque"],
    status: "new",
    createdAt: Date.now() - 200000,
    updatedAt: Date.now() - 150000
  }
];

let entries = loadEntries();
let watchlists = loadWatchlists();
let activeWatchlistId = watchlists.length ? watchlists[0].id : null;
let revisionWatchlistId = null;
let revisionLetter = null;
let activeSelectorWordId = null;
let currentView = "dictionary";
let activeLetter = "All";
let revisionDeck = [];
let revisionIndex = 0;
let meaningRevealed = false;
let revisionShuffled = false;
let generatedEntry = null;
let localServerStatus = { ok: false, hasGeminiKey: false };

const elements = {
  tabs: document.querySelectorAll(".tab"),
  dictionaryView: document.querySelector("#dictionaryView"),
  reviseView: document.querySelector("#reviseView"),
  statsView: document.querySelector("#statsView"),
  watchlistsView: document.querySelector("#watchlistsView"),
  synonymsView: document.querySelector("#synonymsView"),
  newWatchlistButton: document.querySelector("#newWatchlistButton"),
  watchlistItems: document.querySelector("#watchlistItems"),
  activeWatchlistName: document.querySelector("#activeWatchlistName"),
  watchlistCount: document.querySelector("#watchlistCount"),
  watchlistPracticeCount: document.querySelector("#watchlistPracticeCount"),
  watchlistDetailActions: document.querySelector("#watchlistDetailActions"),
  reviseWatchlistButton: document.querySelector("#reviseWatchlistButton"),
  renameWatchlistButton: document.querySelector("#renameWatchlistButton"),
  deleteWatchlistButton: document.querySelector("#deleteWatchlistButton"),
  watchlistAddWordSec: document.querySelector("#watchlistAddWordSec"),
  watchlistWordSearch: document.querySelector("#watchlistWordSearch"),
  watchlistWordDropdown: document.querySelector("#watchlistWordDropdown"),
  watchlistWordList: document.querySelector("#watchlistWordList"),
  synonymsSearchInput: document.querySelector("#synonymsSearchInput"),
  synonymGroupsGrid: document.querySelector("#synonymGroupsGrid"),
  watchlistSelectorModal: document.querySelector("#watchlistSelectorModal"),
  watchlistWordTarget: document.querySelector("#watchlistWordTarget"),
  watchlistCheckboxList: document.querySelector("#watchlistCheckboxList"),
  quickWatchlistName: document.querySelector("#quickWatchlistName"),
  quickWatchlistCreateBtn: document.querySelector("#quickWatchlistCreateBtn"),
  closeWatchlistModalBtn: document.querySelector("#closeWatchlistModalBtn"),
  wordDetailDrawer: document.querySelector("#wordDetailDrawer"),
  closeDrawerBtn: document.querySelector("#closeDrawerBtn"),
  drawerBody: document.querySelector("#drawerBody"),
  watchlistRevisionBanner: document.querySelector("#watchlistRevisionBanner"),
  revisionWatchlistName: document.querySelector("#revisionWatchlistName"),
  exitWatchlistRevisionBtn: document.querySelector("#exitWatchlistRevisionBtn"),
  letterRevisionBanner: document.querySelector("#letterRevisionBanner"),
  revisionLetterName: document.querySelector("#revisionLetterName"),
  exitLetterRevisionBtn: document.querySelector("#exitLetterRevisionBtn"),
  wordForm: document.querySelector("#wordForm"),
  entryId: document.querySelector("#entryId"),
  wordInput: document.querySelector("#wordInput"),
  lookupStatus: document.querySelector("#lookupStatus"),
  generatedPreview: document.querySelector("#generatedPreview"),
  previewPart: document.querySelector("#previewPart"),
  previewMeaning: document.querySelector("#previewMeaning"),
  previewExamples: document.querySelector("#previewExamples"),
  previewSynonyms: document.querySelector("#previewSynonyms"),
  previewAntonyms: document.querySelector("#previewAntonyms"),
  generatedActions: document.querySelector("#generatedActions"),
  confirmGeneratedButton: document.querySelector("#confirmGeneratedButton"),
  clearGeneratedButton: document.querySelector("#clearGeneratedButton"),
  saveWordButton: document.querySelector("#saveWordButton"),
  clearFormButton: document.querySelector("#clearFormButton"),
  newWordButton: document.querySelector("#newWordButton"),
  searchInput: document.querySelector("#searchInput"),
  sortInput: document.querySelector("#sortInput"),
  alphabetStrip: document.querySelector("#alphabetStrip"),
  wordList: document.querySelector("#wordList"),
  wordCount: document.querySelector("#wordCount"),
  dueCount: document.querySelector("#dueCount"),
  exportButton: document.querySelector("#exportButton"),
  importInput: document.querySelector("#importInput"),
  flashcard: document.querySelector("#flashcard"),
  cardPosition: document.querySelector("#cardPosition"),
  cardPart: document.querySelector("#cardPart"),
  cardWord: document.querySelector("#cardWord"),
  cardMeaning: document.querySelector("#cardMeaning"),
  cardExamples: document.querySelector("#cardExamples"),
  cardRelations: document.querySelector("#cardRelations"),
  cardSynonymsGroup: document.querySelector("#cardSynonymsGroup"),
  cardAntonymsGroup: document.querySelector("#cardAntonymsGroup"),
  cardSynonyms: document.querySelector("#cardSynonyms"),
  cardAntonyms: document.querySelector("#cardAntonyms"),
  prevCardButton: document.querySelector("#prevCardButton"),
  nextCardButton: document.querySelector("#nextCardButton"),
  revealButton: document.querySelector("#revealButton"),
  shuffleButton: document.querySelector("#shuffleButton"),
  hardButton: document.querySelector("#hardButton"),
  goodButton: document.querySelector("#goodButton"),
  statTotal: document.querySelector("#statTotal"),
  statMastered: document.querySelector("#statMastered"),
  statPractice: document.querySelector("#statPractice"),
  statExamples: document.querySelector("#statExamples"),
  letterBoard: document.querySelector("#letterBoard"),
  template: document.querySelector("#wordCardTemplate"),
  settingsButton: document.querySelector("#settingsButton"),
  settingsModal: document.querySelector("#settingsModal"),
  closeSettingsModalBtn: document.querySelector("#closeSettingsModalBtn"),
  settingsForm: document.querySelector("#settingsForm"),
  settingsApiKeyInput: document.querySelector("#settingsApiKeyInput"),
  clearApiKeyBtn: document.querySelector("#clearApiKeyBtn"),
  aiNote: document.querySelector("#aiNote")
};

function loadEntries() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) && stored.length ? stored : sampleEntries;
  } catch {
    return sampleEntries;
  }
}

function loadWatchlists() {
  try {
    const stored = JSON.parse(localStorage.getItem(WATCHLISTS_STORAGE_KEY) || "[]");
    if (Array.isArray(stored) && stored.length) {
      return stored;
    }
  } catch (e) {
    console.error("Failed to load watchlists", e);
  }
  return [
    {
      id: "watchlist-starred",
      name: "Starred",
      wordIds: [],
      createdAt: Date.now()
    }
  ];
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function persistWatchlists() {
  localStorage.setItem(WATCHLISTS_STORAGE_KEY, JSON.stringify(watchlists));
}

function normalizeWord(word) {
  return word.trim().replace(/\s+/g, " ");
}

function sortedEntries(list = entries) {
  const sortMode = elements.sortInput.value;
  const copy = [...list];

  if (sortMode === "za") {
    return copy.sort((a, b) => b.word.localeCompare(a.word));
  }

  if (sortMode === "recent") {
    return copy.sort((a, b) => b.createdAt - a.createdAt);
  }

  if (sortMode === "needsPractice") {
    return copy.sort((a, b) => statusRank(a.status) - statusRank(b.status) || a.word.localeCompare(b.word));
  }

  return copy.sort((a, b) => a.word.localeCompare(b.word));
}

function statusRank(status) {
  if (status === "practice") return 0;
  if (status === "new") return 1;
  return 2;
}

function filteredEntries() {
  const query = elements.searchInput.value.trim().toLowerCase();
  return sortedEntries().filter((entry) => {
    const firstLetter = entry.word.charAt(0).toUpperCase();
    const letterMatch = activeLetter === "All" || firstLetter === activeLetter;
    const haystack = [
      entry.word,
      entry.part,
      entry.meaning,
      ...(entry.examples || []),
      ...(entry.synonyms || []),
      ...(entry.antonyms || [])
    ].join(" ").toLowerCase();
    return letterMatch && (!query || haystack.includes(query));
  });
}

function renderAlphabet() {
  elements.alphabetStrip.innerHTML = "";
  ["All", ...alphabet].forEach((letter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `letter-button${letter === activeLetter ? " is-active" : ""}`;
    button.textContent = letter;
    button.addEventListener("click", () => {
      activeLetter = letter;
      render();
    });
    elements.alphabetStrip.append(button);
  });
}

function renderWords() {
  const words = filteredEntries();
  elements.wordList.innerHTML = "";

  if (!words.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No words match this view.";
    elements.wordList.append(empty);
    return;
  }

  words.forEach((entry) => {
    const card = elements.template.content.firstElementChild.cloneNode(true);
    card.querySelector("h3").textContent = entry.word;
    card.querySelector(".part-tag").textContent = entry.part || "Any";
    card.querySelector(".meaning").textContent = entry.meaning;

    const examples = card.querySelector(".examples");
    examples.innerHTML = "";
    entry.examples.forEach((example) => {
      const item = document.createElement("li");
      item.textContent = example;
      examples.append(item);
    });

    const relationsDiv = card.querySelector(".word-relations");
    const synsGroup = card.querySelector(".synonyms-group");
    const synsList = card.querySelector(".synonyms-list");
    const antsGroup = card.querySelector(".antonyms-group");
    const antsList = card.querySelector(".antonyms-list");

    synsList.innerHTML = "";
    antsList.innerHTML = "";

    let hasRelations = false;

    if (entry.synonyms && entry.synonyms.length) {
      synsGroup.hidden = false;
      hasRelations = true;
      entry.synonyms.forEach(syn => {
        const badge = document.createElement("span");
        badge.className = "relation-badge synonym";
        badge.textContent = syn;
        badge.addEventListener("click", (e) => {
          e.stopPropagation();
          fillSearchAndTrigger(syn);
        });
        synsList.append(badge);
      });
    } else {
      synsGroup.hidden = true;
    }

    if (entry.antonyms && entry.antonyms.length) {
      antsGroup.hidden = false;
      hasRelations = true;
      entry.antonyms.forEach(ant => {
        const badge = document.createElement("span");
        badge.className = "relation-badge antonym";
        badge.textContent = ant;
        badge.addEventListener("click", (e) => {
          e.stopPropagation();
          fillSearchAndTrigger(ant);
        });
        antsList.append(badge);
      });
    } else {
      antsGroup.hidden = true;
    }

    relationsDiv.hidden = !hasRelations;

    const statusPill = card.querySelector(".status-pill");
    statusPill.textContent = statusLabel(entry.status);
    statusPill.classList.add(entry.status === "mastered" ? "mastered" : entry.status === "practice" ? "practice" : "new");

    const toggle = card.querySelector(".toggle-status");
    toggle.textContent = entry.status === "mastered" ? "Mark practice" : "Mark remembered";
    toggle.addEventListener("click", () => {
      entry.status = entry.status === "mastered" ? "practice" : "mastered";
      entry.updatedAt = Date.now();
      persist();
      render();
    });

    card.querySelector(".watchlist-toggle-button").addEventListener("click", (e) => {
      e.stopPropagation();
      openWatchlistSelector(entry.id);
    });
    card.querySelector(".edit-button").addEventListener("click", () => refreshEntry(entry.id));
    card.querySelector(".delete-button").addEventListener("click", () => deleteEntry(entry.id));
    elements.wordList.append(card);
  });
}

function statusLabel(status) {
  if (status === "mastered") return "Remembered";
  if (status === "practice") return "Needs practice";
  return "New";
}

function renderStats() {
  const mastered = entries.filter((entry) => entry.status === "mastered").length;
  const practice = entries.filter((entry) => entry.status !== "mastered").length;
  const exampleCount = entries.reduce((total, entry) => total + entry.examples.length, 0);

  elements.wordCount.textContent = entries.length;
  elements.dueCount.textContent = practice;
  elements.statTotal.textContent = entries.length;
  elements.statMastered.textContent = mastered;
  elements.statPractice.textContent = practice;
  elements.statExamples.textContent = exampleCount;

  elements.letterBoard.innerHTML = "";
  alphabet.forEach((letter) => {
    const letterEntries = entries.filter((entry) => entry.word.charAt(0).toUpperCase() === letter);
    if (!letterEntries.length) return;
    const count = letterEntries.length;
    const tile = document.createElement("article");
    tile.className = "letter-tile";
    tile.setAttribute("role", "button");
    tile.setAttribute("tabindex", "0");
    tile.setAttribute("title", `Revise ${letter} words`);
    tile.innerHTML = `
      <strong>${letter}</strong>
      <span>${count} word${count === 1 ? "" : "s"}</span>
      <button class="letter-revise-btn" type="button" data-letter="${letter}" title="Start flashcard session for letter ${letter}">▶ Revise</button>
    `;
    tile.querySelector(".letter-revise-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      startLetterRevision(letter);
    });
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") startLetterRevision(letter);
    });
    elements.letterBoard.append(tile);
  });

  if (!elements.letterBoard.children.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Your letter map will grow as you save words.";
    elements.letterBoard.append(empty);
  }
}

function startLetterRevision(letter) {
  revisionLetter = letter;
  revisionWatchlistId = null;
  revisionIndex = 0;
  revisionShuffled = false;
  meaningRevealed = false;
  switchView("revise");
}

function buildRevisionDeck() {
  const currentIds = revisionDeck.map((entry) => entry.id).sort().join("|");
  let targetEntries = entries;
  
  if (revisionWatchlistId) {
    const wl = watchlists.find(w => w.id === revisionWatchlistId);
    if (wl) {
      targetEntries = entries.filter(e => wl.wordIds.includes(e.id));
    }
  } else if (revisionLetter) {
    targetEntries = entries.filter(e => e.word.charAt(0).toUpperCase() === revisionLetter);
  }

  const nextIds = targetEntries.map((entry) => entry.id).sort().join("|");
  if (revisionShuffled && currentIds === nextIds) {
    revisionIndex = Math.min(revisionIndex, Math.max(revisionDeck.length - 1, 0));
    return;
  }

  revisionDeck = sortedEntries(targetEntries).sort((a, b) => statusRank(a.status) - statusRank(b.status));
  revisionIndex = Math.min(revisionIndex, Math.max(revisionDeck.length - 1, 0));
}

function renderRevision() {
  buildRevisionDeck();

  if (revisionWatchlistId) {
    const wl = watchlists.find(w => w.id === revisionWatchlistId);
    if (wl) {
      elements.watchlistRevisionBanner.hidden = false;
      elements.revisionWatchlistName.textContent = wl.name;
    } else {
      elements.watchlistRevisionBanner.hidden = true;
      revisionWatchlistId = null;
    }
    elements.letterRevisionBanner.hidden = true;
  } else if (revisionLetter) {
    elements.letterRevisionBanner.hidden = false;
    elements.revisionLetterName.textContent = revisionLetter;
    elements.watchlistRevisionBanner.hidden = true;
  } else {
    elements.watchlistRevisionBanner.hidden = true;
    elements.letterRevisionBanner.hidden = true;
  }

  const entry = revisionDeck[revisionIndex];
  elements.cardExamples.innerHTML = "";
  elements.cardSynonyms.innerHTML = "";
  elements.cardAntonyms.innerHTML = "";

  if (!entry) {
    elements.cardPosition.textContent = "0 / 0";
    elements.cardPart.textContent = "";
    if (revisionWatchlistId) {
      elements.cardWord.textContent = "No words to revise";
      elements.cardMeaning.textContent = "Add some words to this watchlist to revise them here.";
    } else if (revisionLetter) {
      elements.cardWord.textContent = `No words under “${revisionLetter}”`;
      elements.cardMeaning.textContent = "Add words starting with this letter to build a deck.";
    } else {
      elements.cardWord.textContent = "Add a word to begin";
      elements.cardMeaning.textContent = "Your revision cards will appear here.";
    }
    elements.flashcard.classList.remove("is-hidden");
    elements.revealButton.disabled = true;
    elements.cardRelations.hidden = true;
    return;
  }

  elements.revealButton.disabled = false;
  elements.cardPosition.textContent = `${revisionIndex + 1} / ${revisionDeck.length}`;
  elements.cardPart.textContent = entry.part || "Any";
  elements.cardWord.textContent = entry.word;
  elements.cardMeaning.textContent = entry.meaning;
  entry.examples.forEach((example) => {
    const item = document.createElement("li");
    item.textContent = example;
    elements.cardExamples.append(item);
  });

  let hasCardRelations = false;

  if (entry.synonyms && entry.synonyms.length) {
    elements.cardSynonymsGroup.hidden = false;
    hasCardRelations = true;
    entry.synonyms.forEach(syn => {
      const badge = document.createElement("span");
      badge.className = "relation-badge synonym";
      badge.textContent = syn;
      elements.cardSynonyms.append(badge);
    });
  } else {
    elements.cardSynonymsGroup.hidden = true;
  }

  if (entry.antonyms && entry.antonyms.length) {
    elements.cardAntonymsGroup.hidden = false;
    hasCardRelations = true;
    entry.antonyms.forEach(ant => {
      const badge = document.createElement("span");
      badge.className = "relation-badge antonym";
      badge.textContent = ant;
      elements.cardAntonyms.append(badge);
    });
  } else {
    elements.cardAntonymsGroup.hidden = true;
  }

  elements.cardRelations.hidden = !hasCardRelations;

  elements.flashcard.classList.toggle("is-hidden", !meaningRevealed);
  elements.revealButton.textContent = meaningRevealed ? "Hide meaning" : "Reveal meaning";
}

function switchView(view) {
  currentView = view;
  elements.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.view === view));
  elements.dictionaryView.classList.toggle("is-visible", view === "dictionary");
  elements.watchlistsView.classList.toggle("is-visible", view === "watchlists");
  elements.synonymsView.classList.toggle("is-visible", view === "synonyms");
  elements.reviseView.classList.toggle("is-visible", view === "revise");
  elements.statsView.classList.toggle("is-visible", view === "stats");
  if (view === "revise") renderRevision();
  if (view === "stats") renderStats();
  if (view === "watchlists") renderWatchlists();
  if (view === "synonyms") renderSynonyms();
}

async function lookupEntry(event) {
  event.preventDefault();
  const word = normalizeWord(elements.wordInput.value);
  if (!word) return;

  setLookupBusy(true);
  setLookupStatus(`Using AI to build a learner-friendly entry for "${word}"...`);

  try {
    generatedEntry = await generateWordDetails(word);
    showGeneratedPreview(generatedEntry);
    setLookupStatus("Details found. Save it when it looks right.");
  } catch (error) {
    generatedEntry = null;
    hideGeneratedPreview();
    setLookupStatus(error.message || "Could not find that word.");
  } finally {
    setLookupBusy(false);
  }
}

async function generateWordDetails(word) {
  try {
    return await fetchAiWordDetails(word);
  } catch (error) {
    console.warn("Gemini lookup failed, falling back to dictionary API.", error);
  }

  return fetchWordDetails(word);
}

async function fetchAiWordDetails(word) {
  const customKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
  
  if (customKey) {
    const model = "gemini-3.1-flash-lite";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(customKey)}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildVocabularyPrompt(word) }]
          }
        ],
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 700,
          responseMimeType: "application/json"
        }
      })
    });
    
    const geminiData = await response.json();
    if (!response.ok) {
      const message = geminiData?.error?.message || "Gemini request failed.";
      throw new Error(message);
    }
    
    const text = geminiData?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();
    const entry = parseGeneratedEntry(text, word);
    
    return {
      ...entry,
      status: "new",
      updatedAt: Date.now()
    };
  }

  // Fallback to local server API endpoint if custom key is not configured
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "AI generation failed.");
  }

  if (!data?.word || !data?.meaning || !Array.isArray(data.examples)) {
    throw new Error("AI returned an incomplete vocabulary entry.");
  }

  return {
    word: normalizeWord(data.word || word),
    part: titleCase(String(data.part || "Word")),
    meaning: String(data.meaning).trim(),
    examples: data.examples.map(String).map(tidySentence).filter(Boolean).slice(0, 4),
    synonyms: Array.isArray(data.synonyms) ? data.synonyms.map(String).map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, 4) : [],
    antonyms: Array.isArray(data.antonyms) ? data.antonyms.map(String).map(a => a.trim().toLowerCase()).filter(Boolean).slice(0, 4) : [],
    status: "new",
    updatedAt: Date.now()
  };
}

async function fetchWordDetails(word) {
  const response = await fetch(`${DICTIONARY_API}${encodeURIComponent(word)}`);
  if (!response.ok) {
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

function createDetailedMeaning(word, part, definitions, synonyms) {
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

function createSimpleExamples(word, part, apiExamples) {
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

function titleCase(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";
}

function showGeneratedPreview(entry) {
  elements.previewPart.textContent = entry.part || "Any";
  elements.previewMeaning.textContent = entry.meaning;
  elements.previewExamples.innerHTML = "";
  entry.examples.forEach((example) => {
    const item = document.createElement("li");
    item.textContent = example;
    elements.previewExamples.append(item);
  });

  elements.previewSynonyms.innerHTML = "";
  elements.previewAntonyms.innerHTML = "";

  const synonymsLabel = elements.generatedPreview.querySelector("small[data-label='synonyms']");
  const antonymsLabel = elements.generatedPreview.querySelector("small[data-label='antonyms']");

  if (entry.synonyms && entry.synonyms.length) {
    if (synonymsLabel) synonymsLabel.hidden = false;
    elements.previewSynonyms.hidden = false;
    entry.synonyms.forEach((syn) => {
      const badge = document.createElement("span");
      badge.className = "relation-badge synonym";
      badge.textContent = syn;
      elements.previewSynonyms.append(badge);
    });
  } else {
    if (synonymsLabel) synonymsLabel.hidden = true;
    elements.previewSynonyms.hidden = true;
  }

  if (entry.antonyms && entry.antonyms.length) {
    if (antonymsLabel) antonymsLabel.hidden = false;
    elements.previewAntonyms.hidden = false;
    entry.antonyms.forEach((ant) => {
      const badge = document.createElement("span");
      badge.className = "relation-badge antonym";
      badge.textContent = ant;
      elements.previewAntonyms.append(badge);
    });
  } else {
    if (antonymsLabel) antonymsLabel.hidden = true;
    elements.previewAntonyms.hidden = true;
  }

  elements.generatedPreview.hidden = false;
  elements.generatedActions.hidden = false;
}

function hideGeneratedPreview() {
  elements.generatedPreview.hidden = true;
  elements.generatedActions.hidden = true;
  elements.previewPart.textContent = "";
  elements.previewMeaning.textContent = "";
  elements.previewExamples.innerHTML = "";
  elements.previewSynonyms.innerHTML = "";
  elements.previewAntonyms.innerHTML = "";

  const synonymsLabel = elements.generatedPreview.querySelector("small[data-label='synonyms']");
  const antonymsLabel = elements.generatedPreview.querySelector("small[data-label='antonyms']");
  if (synonymsLabel) synonymsLabel.hidden = true;
  if (antonymsLabel) antonymsLabel.hidden = true;
  elements.previewSynonyms.hidden = true;
  elements.previewAntonyms.hidden = true;
}

function fillSearchAndTrigger(word) {
  elements.searchInput.value = word;
  renderWords();
}

function setLookupStatus(message) {
  elements.lookupStatus.textContent = message;
}

function setLookupBusy(isBusy) {
  elements.saveWordButton.disabled = isBusy;
  elements.saveWordButton.textContent = isBusy ? "Finding..." : "Add word";
}

function saveGeneratedEntry() {
  if (!generatedEntry) return;
  const word = generatedEntry.word;

  const duplicate = entries.find((entry) => entry.word.toLowerCase() === word.toLowerCase() && entry.id !== elements.entryId.value);
  if (duplicate) {
    entries = entries.map((entry) => entry.id === duplicate.id ? { ...entry, ...generatedEntry, id: duplicate.id, createdAt: duplicate.createdAt } : entry);
  } else {
    entries.push({
      id: createId(),
      ...generatedEntry,
      createdAt: Date.now()
    });
  }

  revisionShuffled = false;
  persist();
  setLookupStatus(`Saved "${word}" to your dictionary.`);
  clearForm(false);
  render();
}

async function refreshEntry(id) {
  const entry = entries.find((item) => item.id === id);
  if (!entry) return;

  const cardWord = entry.word;
  setLookupStatus(`Refreshing "${cardWord}"...`);
  try {
    const refreshed = await generateWordDetails(cardWord);
    entries = entries.map((item) => item.id === id ? { ...item, ...refreshed, id, createdAt: item.createdAt, status: item.status } : item);
    revisionShuffled = false;
    persist();
    setLookupStatus(`Refreshed "${cardWord}".`);
    render();
  } catch (error) {
    setLookupStatus(error.message || `Could not refresh "${cardWord}".`);
  }
}

function deleteEntry(id) {
  const entry = entries.find((item) => item.id === id);
  if (!entry) return;
  const confirmed = confirm(`Delete "${entry.word}" from Lexium?`);
  if (!confirmed) return;
  entries = entries.filter((item) => item.id !== id);
  // Clean up references in watchlists
  watchlists.forEach(wl => {
    wl.wordIds = wl.wordIds.filter(wordId => wordId !== id);
  });
  persistWatchlists();
  revisionShuffled = false;
  persist();
  render();
}

function clearForm(clearStatus = true) {
  elements.wordForm.reset();
  elements.entryId.value = "";
  generatedEntry = null;
  hideGeneratedPreview();
  if (clearStatus) setLookupStatus("");
}

function moveCard(direction) {
  if (!revisionDeck.length) return;
  revisionIndex = (revisionIndex + direction + revisionDeck.length) % revisionDeck.length;
  meaningRevealed = false;
  renderRevision();
}

function markCurrent(status) {
  const entry = revisionDeck[revisionIndex];
  if (!entry) return;
  entries = entries.map((item) => item.id === entry.id ? { ...item, status, updatedAt: Date.now() } : item);
  persist();
  moveCard(1);
  render();
}

function shuffleDeck() {
  revisionDeck = [...revisionDeck].sort(() => Math.random() - 0.5);
  revisionShuffled = true;
  revisionIndex = 0;
  meaningRevealed = false;
  renderRevision();
}

function exportDictionary() {
  const payload = {
    entries,
    watchlists
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `lexium-dictionary-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function importDictionary(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      let incomingEntries = [];
      let incomingWatchlists = [];

      if (Array.isArray(parsed)) {
        incomingEntries = parsed;
      } else if (parsed && typeof parsed === "object" && Array.isArray(parsed.entries)) {
        incomingEntries = parsed.entries;
        if (Array.isArray(parsed.watchlists)) {
          incomingWatchlists = parsed.watchlists;
        }
      } else {
        throw new Error("Invalid dictionary");
      }

      entries = incomingEntries
        .filter((entry) => entry.word && entry.meaning)
        .map((entry) => ({
          id: entry.id || createId(),
          word: normalizeWord(String(entry.word)),
          part: String(entry.part || ""),
          meaning: String(entry.meaning || ""),
          examples: Array.isArray(entry.examples) ? entry.examples.map(String) : [],
          synonyms: Array.isArray(entry.synonyms) ? entry.synonyms.map(String) : [],
          antonyms: Array.isArray(entry.antonyms) ? entry.antonyms.map(String) : [],
          status: ["new", "practice", "mastered"].includes(entry.status) ? entry.status : "new",
          createdAt: Number(entry.createdAt) || Date.now(),
          updatedAt: Number(entry.updatedAt) || Date.now()
        }));

        if (incomingWatchlists.length) {
        watchlists = incomingWatchlists
          .filter(wl => wl.name && Array.isArray(wl.wordIds))
          .map(wl => ({
            id: wl.id || `watchlist-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            name: String(wl.name).trim(),
            wordIds: wl.wordIds.map(String),
            createdAt: Number(wl.createdAt) || Date.now()
          }));
      } else {
        watchlists = [
          {
            id: "watchlist-starred",
            name: "Starred",
            wordIds: [],
            createdAt: Date.now()
          }
        ];
      }

      revisionShuffled = false;
      persist();
      persistWatchlists();
      render();
    } catch {
      alert("That file does not look like a Lexium dictionary export.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function renderWatchlists() {
  elements.watchlistItems.innerHTML = "";
  
  if (!watchlists.length) {
    elements.activeWatchlistName.textContent = "Create a Watchlist";
    elements.watchlistCount.textContent = "0 words";
    elements.watchlistPracticeCount.textContent = "0 need practice";
    elements.watchlistDetailActions.hidden = true;
    elements.watchlistAddWordSec.hidden = true;
    elements.watchlistWordList.innerHTML = `<div class="empty-state">No watchlists. Click "+ New watchlist" to begin.</div>`;
    return;
  }
  let activeWatchlist = watchlists.find(w => w.id === activeWatchlistId);
  if (!activeWatchlist) {
    activeWatchlist = watchlists[0];
    activeWatchlistId = activeWatchlist.id;
  }
  watchlists.forEach(wl => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `watchlist-item${wl.id === activeWatchlistId ? " is-active" : ""}`;
    
    const title = document.createElement("span");
    title.className = "watchlist-item-title";
    title.textContent = wl.name;
    
    const badge = document.createElement("span");
    badge.className = "watchlist-item-count";
    badge.textContent = wl.wordIds.length;
    
    btn.append(title, badge);
    btn.addEventListener("click", () => {
      activeWatchlistId = wl.id;
      elements.watchlistWordSearch.value = "";
      elements.watchlistWordDropdown.hidden = true;
      renderWatchlists();
    });
    
    elements.watchlistItems.append(btn);
  });
  elements.activeWatchlistName.textContent = activeWatchlist.name;
  elements.watchlistDetailActions.hidden = false;
  elements.watchlistAddWordSec.hidden = false;
  const wlWords = entries.filter(e => activeWatchlist.wordIds.includes(e.id));
  const practiceCount = wlWords.filter(e => e.status !== "mastered").length;
  elements.watchlistCount.textContent = `${wlWords.length} word${wlWords.length === 1 ? "" : "s"}`;
  elements.watchlistPracticeCount.textContent = `${practiceCount} need practice`;
  elements.watchlistWordList.innerHTML = "";
  if (!wlWords.length) {
    elements.watchlistWordList.innerHTML = `<div class="empty-state">This watchlist is empty. Add words below.</div>`;
  } else {
    wlWords.sort((a, b) => a.word.localeCompare(b.word));
    
    wlWords.forEach(entry => {
      const item = document.createElement("div");
      item.className = "watchlist-word-item";
      
      const details = document.createElement("div");
      details.style.cursor = "pointer";
      details.addEventListener("click", () => showWordDetails(entry.id));
      
      const wordTitle = document.createElement("strong");
      wordTitle.textContent = entry.word;
      wordTitle.style.fontSize = "1.1rem";
      wordTitle.style.marginRight = "8px";
      
      const part = document.createElement("span");
      part.className = "part-tag";
      part.textContent = entry.part || "Word";
      part.style.fontSize = "0.8rem";
      
      const desc = document.createElement("p");
      desc.textContent = entry.meaning;
      desc.style.margin = "4px 0 0";
      desc.style.fontSize = "0.9rem";
      desc.style.color = "var(--muted)";
      desc.style.display = "-webkit-box";
      desc.style.webkitLineClamp = "1";
      desc.style.webkitBoxOrient = "vertical";
      desc.style.overflow = "hidden";
      
      details.append(wordTitle, part, desc);
      
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "icon-button";
      removeBtn.title = "Remove from watchlist";
      removeBtn.innerHTML = "&times;";
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeWordFromWatchlist(entry.id, activeWatchlist.id);
      });
      
      item.append(details, removeBtn);
      elements.watchlistWordList.append(item);
    });
  }
}
function handleWatchlistWordSearch() {
  const query = elements.watchlistWordSearch.value.trim().toLowerCase();
  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId);
  if (!activeWatchlist) return;
  if (!query) {
    elements.watchlistWordDropdown.innerHTML = "";
    elements.watchlistWordDropdown.hidden = true;
    return;
  }
  const candidates = entries.filter(e => {
    const notInWatchlist = !activeWatchlist.wordIds.includes(e.id);
    const matchesQuery = e.word.toLowerCase().includes(query) || 
                         (e.meaning && e.meaning.toLowerCase().includes(query));
    return notInWatchlist && matchesQuery;
  });
  elements.watchlistWordDropdown.innerHTML = "";
  if (!candidates.length) {
    const item = document.createElement("div");
    item.className = "search-select-item";
    item.style.color = "var(--muted)";
    item.style.cursor = "default";
    item.textContent = "No matching words found in dictionary";
    elements.watchlistWordDropdown.append(item);
  } else {
    candidates.slice(0, 5).forEach(entry => {
      const item = document.createElement("div");
      item.className = "search-select-item";
      
      const name = document.createElement("span");
      name.className = "word-name";
      name.textContent = entry.word;
      
      const part = document.createElement("span");
      part.className = "word-part";
      part.textContent = entry.part || "";
      
      item.append(name, part);
      item.addEventListener("click", () => {
        addWordToWatchlist(entry.id, activeWatchlist.id);
        elements.watchlistWordSearch.value = "";
        elements.watchlistWordDropdown.hidden = true;
      });
      elements.watchlistWordDropdown.append(item);
    });
  }
  elements.watchlistWordDropdown.hidden = false;
}
function handleCreateWatchlist() {
  const name = prompt("Enter watchlist name:");
  if (!name) return;
  const cleanName = name.trim();
  if (!cleanName) return;
  
  if (watchlists.some(w => w.name.toLowerCase() === cleanName.toLowerCase())) {
    alert("A watchlist with this name already exists.");
    return;
  }
  const newWl = {
    id: `watchlist-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: cleanName,
    wordIds: [],
    createdAt: Date.now()
  };
  watchlists.push(newWl);
  persistWatchlists();
  activeWatchlistId = newWl.id;
  renderWatchlists();
}
function handleRenameWatchlist() {
  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId);
  if (!activeWatchlist) return;
  const name = prompt("Rename watchlist:", activeWatchlist.name);
  if (!name) return;
  const cleanName = name.trim();
  if (!cleanName || cleanName === activeWatchlist.name) return;
  if (watchlists.some(w => w.name.toLowerCase() === cleanName.toLowerCase() && w.id !== activeWatchlistId)) {
    alert("A watchlist with this name already exists.");
    return;
  }
  activeWatchlist.name = cleanName;
  persistWatchlists();
  renderWatchlists();
}
function handleDeleteWatchlist() {
  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId);
  if (!activeWatchlist) return;
  if (!confirm(`Are you sure you want to delete the watchlist "${activeWatchlist.name}"?`)) return;
  watchlists = watchlists.filter(w => w.id !== activeWatchlistId);
  persistWatchlists();
  activeWatchlistId = watchlists.length ? watchlists[0].id : null;
  renderWatchlists();
}
function addWordToWatchlist(wordId, watchlistId) {
  const wl = watchlists.find(w => w.id === watchlistId);
  if (wl && !wl.wordIds.includes(wordId)) {
    wl.wordIds.push(wordId);
    persistWatchlists();
    renderWatchlists();
  }
}
function removeWordFromWatchlist(wordId, watchlistId) {
  const wl = watchlists.find(w => w.id === watchlistId);
  if (wl) {
    wl.wordIds = wl.wordIds.filter(id => id !== wordId);
    persistWatchlists();
    renderWatchlists();
  }
}
function openWatchlistSelector(wordId) {
  const entry = entries.find(e => e.id === wordId);
  if (!entry) return;
  activeSelectorWordId = wordId;
  elements.watchlistWordTarget.textContent = entry.word;
  
  elements.watchlistCheckboxList.innerHTML = "";
  watchlists.forEach(wl => {
    const label = document.createElement("label");
    label.className = "watchlist-checkbox-item";
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = wl.wordIds.includes(wordId);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        if (!wl.wordIds.includes(wordId)) wl.wordIds.push(wordId);
      } else {
        wl.wordIds = wl.wordIds.filter(id => id !== wordId);
      }
      persistWatchlists();
      renderWatchlists();
    });
    
    const span = document.createElement("span");
    span.textContent = wl.name;
    
    label.append(checkbox, span);
    elements.watchlistCheckboxList.append(label);
  });
  elements.quickWatchlistName.value = "";
  elements.watchlistSelectorModal.hidden = false;
}
function handleQuickWatchlistCreate() {
  const name = elements.quickWatchlistName.value.trim();
  if (!name) return;
  
  if (watchlists.some(w => w.name.toLowerCase() === name.toLowerCase())) {
    alert("A watchlist with this name already exists.");
    return;
  }
  const newWl = {
    id: `watchlist-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: name,
    wordIds: activeSelectorWordId ? [activeSelectorWordId] : [],
    createdAt: Date.now()
  };
  watchlists.push(newWl);
  persistWatchlists();
  elements.quickWatchlistName.value = "";
  
  if (activeSelectorWordId) {
    openWatchlistSelector(activeSelectorWordId);
  }
  renderWatchlists();
}
function calculateSynonymGroups() {
  const groups = {};
  
  entries.forEach(entry => {
    const wordLower = entry.word.toLowerCase();
    
    if (!groups[wordLower]) groups[wordLower] = new Set();
    groups[wordLower].add(entry);
    if (entry.synonyms && Array.isArray(entry.synonyms)) {
      entry.synonyms.forEach(syn => {
        const synLower = syn.trim().toLowerCase();
        if (synLower) {
          if (!groups[synLower]) groups[synLower] = new Set();
          groups[synLower].add(entry);
        }
      });
    }
  });
  const groupList = [];
  const searchQuery = elements.synonymsSearchInput.value.trim().toLowerCase();
  for (const synonym in groups) {
    const words = Array.from(groups[synonym]);
    if (words.length >= 2) {
      const matchesSearch = !searchQuery || 
                            synonym.includes(searchQuery) || 
                            words.some(e => e.word.toLowerCase().includes(searchQuery));
      
      if (matchesSearch) {
        groupList.push({
          synonym,
          words: words.sort((a, b) => a.word.localeCompare(b.word))
        });
      }
    }
  }
  return groupList.sort((a, b) => b.words.length - a.words.length || a.synonym.localeCompare(b.synonym));
}
function renderSynonyms() {
  const groups = calculateSynonymGroups();
  elements.synonymGroupsGrid.innerHTML = "";
  if (!groups.length) {
    elements.synonymGroupsGrid.innerHTML = `<div class="empty-state">No synonym groups found. Add more words with overlapping synonyms (e.g. synonyms that are also dictionary entries or shared across entries).</div>`;
    return;
  }
  groups.forEach(g => {
    const card = document.createElement("div");
    card.className = "synonym-group-card";
    
    const header = document.createElement("div");
    header.className = "synonym-group-header";
    
    const title = document.createElement("h4");
    title.className = "synonym-group-title";
    title.textContent = g.synonym;
    
    const badge = document.createElement("span");
    badge.className = "synonym-group-count";
    badge.textContent = `${g.words.length} words`;
    
    header.append(title, badge);
    
    const list = document.createElement("div");
    list.className = "synonym-group-words";
    
    g.words.forEach(entry => {
      const badgeWord = document.createElement("span");
      badgeWord.className = "synonym-word-badge";
      
      const text = document.createElement("span");
      text.textContent = entry.word;
      
      const part = document.createElement("small");
      part.style.fontSize = "0.7rem";
      part.style.opacity = "0.6";
      part.textContent = ` (${entry.part || "Word"})`;
      
      badgeWord.append(text, part);
      badgeWord.addEventListener("click", () => showWordDetails(entry.id));
      
      list.append(badgeWord);
    });
    
    card.append(header, list);
    elements.synonymGroupsGrid.append(card);
  });
}
function showWordDetails(wordId) {
  const entry = entries.find(e => e.id === wordId);
  if (!entry) return;
  elements.drawerBody.innerHTML = "";
  
  const card = elements.template.content.firstElementChild.cloneNode(true);
  card.querySelector("h3").textContent = entry.word;
  card.querySelector(".part-tag").textContent = entry.part || "Any";
  card.querySelector(".meaning").textContent = entry.meaning;
  const examples = card.querySelector(".examples");
  examples.innerHTML = "";
  entry.examples.forEach((example) => {
    const item = document.createElement("li");
    item.textContent = example;
    examples.append(item);
  });
  const relationsDiv = card.querySelector(".word-relations");
  const synsGroup = card.querySelector(".synonyms-group");
  const synsList = card.querySelector(".synonyms-list");
  const antsGroup = card.querySelector(".antonyms-group");
  const antsList = card.querySelector(".antonyms-list");
  synsList.innerHTML = "";
  antsList.innerHTML = "";
  let hasRelations = false;
  if (entry.synonyms && entry.synonyms.length) {
    synsGroup.hidden = false;
    hasRelations = true;
    entry.synonyms.forEach(syn => {
      const badge = document.createElement("span");
      badge.className = "relation-badge synonym";
      badge.textContent = syn;
      badge.addEventListener("click", (e) => {
        e.stopPropagation();
        elements.wordDetailDrawer.hidden = true;
        fillSearchAndTrigger(syn);
      });
      synsList.append(badge);
    });
  } else {
    synsGroup.hidden = true;
  }
  if (entry.antonyms && entry.antonyms.length) {
    antsGroup.hidden = false;
    hasRelations = true;
    entry.antonyms.forEach(ant => {
      const badge = document.createElement("span");
      badge.className = "relation-badge antonym";
      badge.textContent = ant;
      badge.addEventListener("click", (e) => {
        e.stopPropagation();
        elements.wordDetailDrawer.hidden = true;
        fillSearchAndTrigger(ant);
      });
      antsList.append(badge);
    });
  } else {
    antsGroup.hidden = true;
  }
  relationsDiv.hidden = !hasRelations;
  const statusPill = card.querySelector(".status-pill");
  statusPill.textContent = statusLabel(entry.status);
  statusPill.classList.add(entry.status === "mastered" ? "mastered" : entry.status === "practice" ? "practice" : "new");
  const toggle = card.querySelector(".toggle-status");
  toggle.textContent = entry.status === "mastered" ? "Mark practice" : "Mark remembered";
  toggle.addEventListener("click", () => {
    entry.status = entry.status === "mastered" ? "practice" : "mastered";
    entry.updatedAt = Date.now();
    persist();
    render();
    showWordDetails(wordId);
  });
  card.querySelector(".edit-button").addEventListener("click", async () => {
    elements.wordDetailDrawer.hidden = true;
    await refreshEntry(entry.id);
  });
  
  card.querySelector(".delete-button").addEventListener("click", () => {
    elements.wordDetailDrawer.hidden = true;
    deleteEntry(entry.id);
  });
  
  card.querySelector(".watchlist-toggle-button").addEventListener("click", (e) => {
    e.stopPropagation();
    openWatchlistSelector(entry.id);
  });
  elements.drawerBody.append(card);
  elements.wordDetailDrawer.hidden = false;
}
function render() {
  renderAlphabet();
  renderWords();
  renderStats();
  renderWatchlists();
  renderSynonyms();
  if (currentView === "revise") renderRevision();
}

function render() {
  renderAlphabet();
  renderWords();
  renderStats();
  renderWatchlists();
  renderSynonyms();
  if (currentView === "revise") renderRevision();
}

elements.tabs.forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));
elements.wordForm.addEventListener("submit", lookupEntry);
elements.confirmGeneratedButton.addEventListener("click", saveGeneratedEntry);
elements.clearGeneratedButton.addEventListener("click", clearForm);
elements.clearFormButton.addEventListener("click", clearForm);
elements.newWordButton.addEventListener("click", () => {
  clearForm();
  elements.wordInput.focus();
});
elements.searchInput.addEventListener("input", renderWords);
elements.sortInput.addEventListener("change", renderWords);
elements.prevCardButton.addEventListener("click", () => moveCard(-1));
elements.nextCardButton.addEventListener("click", () => moveCard(1));
elements.revealButton.addEventListener("click", () => {
  meaningRevealed = !meaningRevealed;
  renderRevision();
});
elements.shuffleButton.addEventListener("click", shuffleDeck);
elements.hardButton.addEventListener("click", () => markCurrent("practice"));
elements.goodButton.addEventListener("click", () => markCurrent("mastered"));
elements.exportButton.addEventListener("click", exportDictionary);
elements.importInput.addEventListener("change", importDictionary);

elements.newWatchlistButton.addEventListener("click", handleCreateWatchlist);
elements.renameWatchlistButton.addEventListener("click", handleRenameWatchlist);
elements.deleteWatchlistButton.addEventListener("click", handleDeleteWatchlist);
elements.watchlistWordSearch.addEventListener("input", handleWatchlistWordSearch);
elements.quickWatchlistCreateBtn.addEventListener("click", handleQuickWatchlistCreate);
elements.closeWatchlistModalBtn.addEventListener("click", () => {
  elements.watchlistSelectorModal.hidden = true;
});
elements.closeDrawerBtn.addEventListener("click", () => {
  elements.wordDetailDrawer.hidden = true;
});
elements.synonymsSearchInput.addEventListener("input", renderSynonyms);
elements.reviseWatchlistButton.addEventListener("click", () => {
  if (!activeWatchlistId) return;
  const wl = watchlists.find(w => w.id === activeWatchlistId);
  if (!wl) return;
  if (!wl.wordIds.length) {
    alert("Add some words to this watchlist first before revising!");
    return;
  }
  revisionWatchlistId = activeWatchlistId;
  revisionLetter = null;
  revisionIndex = 0;
  revisionShuffled = false;
  meaningRevealed = false;
  switchView("revise");
});
elements.exitWatchlistRevisionBtn.addEventListener("click", () => {
  revisionWatchlistId = null;
  revisionIndex = 0;
  revisionShuffled = false;
  meaningRevealed = false;
  renderRevision();
});
elements.exitLetterRevisionBtn.addEventListener("click", () => {
  revisionLetter = null;
  revisionIndex = 0;
  revisionShuffled = false;
  meaningRevealed = false;
  renderRevision();
});
elements.watchlistSelectorModal.addEventListener("click", (e) => {
  if (e.target === elements.watchlistSelectorModal) {
    elements.watchlistSelectorModal.hidden = true;
  }
});
elements.wordDetailDrawer.addEventListener("click", (e) => {
  if (e.target === elements.wordDetailDrawer) {
    elements.wordDetailDrawer.hidden = true;
  }
});
document.addEventListener("click", (e) => {
  if (!elements.watchlistWordSearch.contains(e.target) && !elements.watchlistWordDropdown.contains(e.target)) {
    elements.watchlistWordDropdown.hidden = true;
  }
});

// Settings and API Key Management
const GEMINI_API_KEY_STORAGE_KEY = "lexium.gemini.apikey";

async function checkLocalServer() {
  try {
    const res = await fetch("/api/health");
    if (res.ok) {
      localServerStatus = await res.json();
    } else {
      localServerStatus = { ok: false, hasGeminiKey: false };
    }
  } catch (e) {
    localServerStatus = { ok: false, hasGeminiKey: false };
  }
}

function updateApiStatusDisplay() {
  const customKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
  if (customKey) {
    elements.aiNote.textContent = "Gemini AI is active using your custom API key (direct client-side requests).";
    elements.aiNote.style.color = "var(--green)";
    elements.settingsApiKeyInput.value = customKey;
  } else if (localServerStatus.ok && localServerStatus.hasGeminiKey) {
    elements.aiNote.textContent = `Gemini AI is active using the local backend (Model: ${localServerStatus.model || 'Gemini'}).`;
    elements.aiNote.style.color = "var(--teal-dark)";
    elements.settingsApiKeyInput.value = "";
  } else {
    elements.aiNote.textContent = "Gemini AI is not configured. Lexium will fall back to the free dictionary API. Click 'Settings' below to add your Gemini key.";
    elements.aiNote.style.color = "var(--muted)";
    elements.settingsApiKeyInput.value = "";
  }
}

function openSettingsModal() {
  const customKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY) || "";
  elements.settingsApiKeyInput.value = customKey;
  elements.settingsModal.hidden = false;
}

function closeSettingsModal() {
  elements.settingsModal.hidden = true;
}

function saveApiKey(event) {
  event.preventDefault();
  const key = elements.settingsApiKeyInput.value.trim();
  if (key) {
    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, key);
  } else {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
  }
  closeSettingsModal();
  updateApiStatusDisplay();
}

function clearApiKey() {
  localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
  elements.settingsApiKeyInput.value = "";
  closeSettingsModal();
  updateApiStatusDisplay();
}

// Client-Side Gemini Prompt and Parsing logic (mirrors server.js)
function buildVocabularyPrompt(word) {
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

function parseGeneratedEntry(text, fallbackWord) {
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

elements.settingsButton.addEventListener("click", openSettingsModal);
elements.closeSettingsModalBtn.addEventListener("click", closeSettingsModal);
elements.settingsForm.addEventListener("submit", saveApiKey);
elements.clearApiKeyBtn.addEventListener("click", clearApiKey);
elements.settingsModal.addEventListener("click", (e) => {
  if (e.target === elements.settingsModal) {
    closeSettingsModal();
  }
});

render();
checkLocalServer().then(() => updateApiStatusDisplay());
