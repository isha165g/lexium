import {
    generateWord,
    health
} from "./api/lexiumApi.js";

import {
    loadEntries,
    saveEntries
}
from "./storage/dictionaryStorage.js";

import {
    loadWatchlists,
    saveWatchlists
}
from "./storage/watchlistStorage.js";

import {
  createId,
  statusLabel,
  statusRank,
  normalizeWord
} 
from "./shared/helper.js";

import {
    generateWordDetails
}
from "./services/dictionaryService.js";

import {
    saveGeneratedEntry,
    deleteEntry,
    refreshEntry,
    markCurrent
}
from "./services/dictionaryManager.js";

import {
    createWatchlist,
    renameWatchlist,
    deleteWatchlist,
    addWordToWatchlist,
    removeWordFromWatchlist,
    calculateSynonymGroups
}
from "./services/watchlistService.js";

import {
    buildRevisionDeck,
    shuffleDeck,
    startLetterRevision
}
from "./services/revisionService.js";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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

let entries = loadEntries(sampleEntries);
let watchlists = loadWatchlists([
    {
        id: "watchlist-starred",
        name: "Starred",
        wordIds: [],
        createdAt: Date.now()
        }
    ]);
let revisionState = {
    deck: [],
    index: 0,
    watchlistId: null,
    letter: null,
    revealed: false,
    shuffled: false
};
let activeWatchlistId = watchlists.length ? watchlists[0].id : null;
let activeSelectorWordId = null;
let currentView = "dictionary";
let activeLetter = "All";
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
      saveEntries(entries);
      render();
    });

    card.querySelector(".watchlist-toggle-button").addEventListener("click", (e) => {
      e.stopPropagation();
      openWatchlistSelector(entry.id);
    });
    card.querySelector(".edit-button").addEventListener("click", async () => {

        setLookupStatus(`Refreshing "${entry.word}"...`);

        try {

            const result = await refreshEntry({
                entries,
                id: entry.id
            });

            entries = result.entries;

            revisionState.shuffled = false;

            render();

            setLookupStatus(result.message);

        } catch (error) {

            setLookupStatus(error.message);

        }

    });
    card.querySelector(".delete-button").addEventListener("click", () => {

        const confirmed = confirm(`Delete "${entry.word}" from Lexium?`);

        if (!confirmed) return;

        const result = deleteEntry({
            entries,
            watchlists,
            id: entry.id
        });

        entries = result.entries;
        watchlists = result.watchlists;

        revisionState.shuffled = false;

        render();
    });
    elements.wordList.append(card);
  });
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

      const state = startLetterRevision(letter);

      revisionState.letter = state.revisionLetter;
      revisionState.watchlistId = state.revisionWatchlistId;
      revisionState.index = state.revisionIndex;
      revisionState.shuffled = state.revisionShuffled;
      revisionState.revealed = state.meaningRevealed;

      switchView("revise");

    });
  
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        
        e.stopPropagation();

        const state = startLetterRevision(letter);

        revisionState.letter = state.revisionLetter;
        revisionState.watchlistId = state.revisionWatchlistId;
        revisionState.index = state.revisionIndex;
        revisionState.shuffled = state.revisionShuffled;
        revisionState.revealed = state.meaningRevealed;

        switchView("revise");
        
      }
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

function renderRevision() {
  const revisionResult = buildRevisionDeck({
    entries,
    watchlists,
    revisionDeck: revisionState.deck,
    revisionWatchlistId: revisionState.watchlistId,
    revisionLetter: revisionState.letter,
    revisionIndex: revisionState.index,
    revisionShuffled: revisionState.shuffled,
    sortedEntries,
    statusRank
  });

  revisionState.deck = revisionResult.revisionDeck;
  revisionState.index = revisionResult.revisionIndex;
  
  if (revisionState.watchlistId) {
    const wl = watchlists.find(w => w.id === revisionState.watchlistId);
    if (wl) {
      elements.watchlistRevisionBanner.hidden = false;
      elements.revisionWatchlistName.textContent = wl.name;
    } else {
      elements.watchlistRevisionBanner.hidden = true;
      revisionState.watchlistId = null;
    }
    elements.letterRevisionBanner.hidden = true;
  } else if (revisionState.letter) {
    elements.letterRevisionBanner.hidden = false;
    elements.revisionLetterName.textContent = revisionState.letter;
    elements.watchlistRevisionBanner.hidden = true;
  } else {
    elements.watchlistRevisionBanner.hidden = true;
    elements.letterRevisionBanner.hidden = true;
  }

  const entry = revisionState.deck[revisionState.index];
  elements.cardExamples.innerHTML = "";
  elements.cardSynonyms.innerHTML = "";
  elements.cardAntonyms.innerHTML = "";

  if (!entry) {
    elements.cardPosition.textContent = "0 / 0";
    elements.cardPart.textContent = "";
    if (revisionState.watchlistId) {
      elements.cardWord.textContent = "No words to revise";
      elements.cardMeaning.textContent = "Add some words to this watchlist to revise them here.";
    } else if (revisionState.letter) {
      elements.cardWord.textContent = `No words under “${revisionState.letter}”`;
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
  elements.cardPosition.textContent = `${revisionState.index + 1} / ${revisionState.deck.length}`;
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

  elements.flashcard.classList.toggle("is-hidden", !revisionState.revealed);
  elements.revealButton.textContent = revisionState.revealed ? "Hide meaning" : "Reveal meaning";
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

function clearForm(clearStatus = true) {
  elements.wordForm.reset();
  elements.entryId.value = "";
  generatedEntry = null;
  hideGeneratedPreview();
  if (clearStatus) setLookupStatus("");
}

function moveCard(direction) {
  if (!revisionState.deck.length) return;

  revisionState.index =
    (
        revisionState.index +
        direction +
        revisionState.deck.length
    ) % revisionState.deck.length;

  revisionState.revealed = false;
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

      revisionState.shuffled = false;
      saveEntries(entries);
      saveWatchlists(watchlists);
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
        watchlists = removeWordFromWatchlist({
          watchlists,
          wordId: entry.id,
          watchlistId: activeWatchlist.id
        });
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
        watchlists = addWordToWatchlist({
          watchlists,
          wordId: entry.id,
          watchlistId: activeWatchlist.id
        });
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
    const result = createWatchlist({
        watchlists,
        name
    });

    if (!result.success) {
        alert(result.message);
        return;
    }

    watchlists = result.watchlists;
    activeWatchlistId = result.watchlist.id;
    renderWatchlists();
}

function handleRenameWatchlist() {
    const activeWatchlist = watchlists.find(
        w => w.id === activeWatchlistId
    );
    if (!activeWatchlist) return;
    const name = prompt(
        "Rename watchlist:",
        activeWatchlist.name
    );
    if (!name) return;
    const result = renameWatchlist({
        watchlists,
        watchlistId: activeWatchlistId,
        newName: name
    });
    if (!result.success) {
        alert(result.message);
        return;
    }
    watchlists = result.watchlists;
    renderWatchlists();
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
            watchlists = addWordToWatchlist({
                watchlists,
                wordId,
                watchlistId: wl.id
            });
        } else {
            watchlists = removeWordFromWatchlist({
                watchlists,
                wordId,
                watchlistId: wl.id
            });
        }
        openWatchlistSelector(wordId);
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
    const result = createWatchlist({
        watchlists,
        name,
        wordIds: activeSelectorWordId
            ? [activeSelectorWordId]
            : []
    });
    
    if (!result.success) {
        alert(result.message);
        return;
    }
    watchlists = result.watchlists;
    activeWatchlistId = result.watchlist.id;
    elements.quickWatchlistName.value = "";
    openWatchlistSelector(activeSelectorWordId);
    renderWatchlists();

}

function handleDeleteWatchlist() {

    const activeWatchlist = watchlists.find(
        w => w.id === activeWatchlistId
    );

    if (!activeWatchlist) return;

    if (
        !confirm(
            `Are you sure you want to delete the watchlist "${activeWatchlist.name}"?`
        )
    ) {
        return;
    }

    watchlists = deleteWatchlist({
        watchlists,
        watchlistId: activeWatchlistId
    });

    activeWatchlistId =
        watchlists.length
            ? watchlists[0].id
            : null;

    renderWatchlists();
}


function renderSynonyms() {
  const groups = calculateSynonymGroups({
    entries,
    searchQuery: elements.synonymsSearchInput.value
  });
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
    saveEntries(entries);
    render();
    showWordDetails(wordId);
  });
  card.querySelector(".edit-button").addEventListener("click", async () => {
    elements.wordDetailDrawer.hidden = true;
    setLookupStatus(`Refreshing "${entry.word}"...`);
    try {

        const result = await refreshEntry({
            entries,
            id: entry.id
        });

        entries = result.entries;

        revisionState.shuffled = false;

        render();

        setLookupStatus(result.message);

    } catch (error) {

        setLookupStatus(error.message);

    }
  });
  
  card.querySelector(".delete-button").addEventListener("click", () => {
    elements.wordDetailDrawer.hidden = true;
    const confirmed = confirm(`Delete "${entry.word}" from Lexium?`);

    if (!confirmed) return;

    const result = deleteEntry({
        entries,
        watchlists,
        id: entry.id
    });

    entries = result.entries;
    watchlists = result.watchlists;

    revisionState.shuffled = false;

    render();
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

function bindEvents() {

  // -------------------------
  // Navigation
  // -------------------------

  elements.tabs.forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));

  // -------------------------
  // Dictionary & Search
  // -------------------------

  elements.wordForm.addEventListener("submit", lookupEntry);

  elements.confirmGeneratedButton.addEventListener("click", () => {
    const result = saveGeneratedEntry({
        entries,  
        generatedEntry,
        entryId: elements.entryId.value
    });

    if (!result.saved) return;

    entries = result.entries;

    revisionState.shuffled = false;

    clearForm(false);

    render();

    setLookupStatus(result.message);
  });
  elements.clearGeneratedButton.addEventListener("click", clearForm);
  elements.clearFormButton.addEventListener("click", clearForm);
  elements.newWordButton.addEventListener("click", () => {
    clearForm();
    elements.wordInput.focus();
  });
  elements.searchInput.addEventListener("input", renderWords);
  elements.sortInput.addEventListener("change", renderWords);

  // -------------------------
  // Revision
  // -------------------------

  elements.prevCardButton.addEventListener("click", () => moveCard(-1));
  elements.nextCardButton.addEventListener("click", () => moveCard(1));
  elements.revealButton.addEventListener("click", () => {
    revisionState.revealed = !revisionState.revealed;
    renderRevision();
  });
  elements.shuffleButton.addEventListener("click", () => {
    const result = shuffleDeck(revisionState.deck);

    revisionState.deck = result.deck;
    revisionState.index = result.index;
    revisionState.shuffled = result.shuffled;
    revisionState.revealed = result.revealed;

    renderRevision();
  });
  elements.hardButton.addEventListener("click", () => {

    const entry = revisionState.deck[revisionState.index];
    if (!entry) return;

    const result = markCurrent({
        entries,
        entryId: entry.id,
        status: "practice"
    });

    entries = result.entries;

    moveCard(1);

    render();
  });
  elements.goodButton.addEventListener("click", () => {

    const entry = revisionState.deck[revisionState.index];
    if (!entry) return;

    const result = markCurrent({
        entries,
        entryId: entry.id,
        status: "mastered"
    });

    entries = result.entries;

    moveCard(1);

    render();
  });
  
    // -------------------------
    // Import / Export
    // -------------------------

  elements.exportButton.addEventListener("click", exportDictionary);  
  elements.importInput.addEventListener("change", importDictionary);

    // -------------------------
    // Watchlists
    // -------------------------

  elements.newWatchlistButton.addEventListener("click", handleCreateWatchlist);
  elements.renameWatchlistButton.addEventListener("click", handleRenameWatchlist);
  elements.deleteWatchlistButton.addEventListener("click", handleDeleteWatchlist);
  elements.watchlistWordSearch.addEventListener("input", handleWatchlistWordSearch);
  elements.quickWatchlistCreateBtn.addEventListener("click", handleQuickWatchlistCreate);

    // -------------------------
    // Modals
    // -------------------------

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
    revisionState.watchlistId = activeWatchlistId;
    revisionState.letter = null;
    revisionState.index = 0;
    revisionState.shuffled = false;
    revisionState.revealed = false;
    switchView("revise");
  });
  elements.exitWatchlistRevisionBtn.addEventListener("click", () => {
    revisionState.watchlistId = null;
    revisionState.index = 0;
    revisionState.shuffled = false;
    revisionState.revealed = false;
    renderRevision();
  });
  elements.exitLetterRevisionBtn.addEventListener("click", () => {
    revisionState.letter = null;
    revisionState.index = 0;
    revisionState.shuffled = false;
    revisionState.revealed = false;
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

    // -------------------------
    // Global
    // -------------------------

  document.addEventListener("click", (e) => {
    if (!elements.watchlistWordSearch.contains(e.target) && !elements.watchlistWordDropdown.contains(e.target)) {
      elements.watchlistWordDropdown.hidden = true;
    }
  });
}

async function checkBackend() {
  try {
    localServerStatus = await health();
  } catch {
    localServerStatus = {
      ok: false,
      hasGeminiKey: false
    };
  }
}

function updateApiStatusDisplay() {
  if (localServerStatus.ok && localServerStatus.hasGeminiKey) {
    elements.aiNote.textContent =
      `AI connected (${localServerStatus.model})`;
    elements.aiNote.style.color = "var(--green)";
  } else {
    elements.aiNote.textContent =
      "AI unavailable. Using the free dictionary.";
    elements.aiNote.style.color = "var(--muted)";
  }
}

async function initializeApp() {
    bindEvents();
    render();
    await checkBackend();
    updateApiStatusDisplay();
}

initializeApp();