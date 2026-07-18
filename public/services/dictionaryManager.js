import { saveEntries } from "../storage/dictionaryStorage.js";
import { saveWatchlists } from "../storage/watchlistStorage.js";
import { createId } from "../shared/helper.js";
import { generateWordDetails } from "./dictionaryService.js";

export function saveGeneratedEntry({
    entries,
    generatedEntry,
    entryId
}) {
    if (!generatedEntry) {
        return {
            entries,
            saved: false
        };
    }

    const word = generatedEntry.word;

    let updatedEntries = [...entries];

    const duplicate = updatedEntries.find(
        entry =>
            entry.word.toLowerCase() === word.toLowerCase() &&
            entry.id !== entryId
    );

    if (duplicate) {
        updatedEntries = updatedEntries.map(entry =>
            entry.id === duplicate.id
                ? {
                      ...entry,
                      ...generatedEntry,
                      id: duplicate.id,
                      createdAt: duplicate.createdAt
                  }
                : entry
        );
    } else {
        updatedEntries.push({
            id: createId(),
            ...generatedEntry,
            createdAt: Date.now()
        });
    }

    saveEntries(updatedEntries);

    return {
        entries: updatedEntries,
        saved: true,
        message: `Saved "${word}" to your dictionary.`
    };
}

export function deleteEntry({
    entries,
    watchlists,
    id
}) {
    let updatedEntries = entries.filter(item => item.id !== id);

    const updatedWatchlists = watchlists.map(wl => ({
        ...wl,
        wordIds: wl.wordIds.filter(wordId => wordId !== id)
    }));

    saveEntries(updatedEntries);
    saveWatchlists(updatedWatchlists);

    return {
        entries: updatedEntries,
        watchlists: updatedWatchlists
    };
}

export async function refreshEntry({
    entries,
    id
}) {
    const entry = entries.find(item => item.id === id);

    if (!entry) {
        throw new Error("Word not found.");
    }

    const refreshed = await generateWordDetails(entry.word);

    const updatedEntries = entries.map(item =>
        item.id === id
            ? {
                  ...item,
                  ...refreshed,
                  id,
                  createdAt: item.createdAt,
                  status: item.status
              }
            : item
    );

    saveEntries(updatedEntries);

    return {
        entries: updatedEntries,
        message: `Refreshed "${entry.word}".`
    };
}

export function markCurrent({
    entries,
    entryId,
    status
}) {
    const updatedEntries = entries.map(item =>
        item.id === entryId
            ? {
                  ...item,
                  status,
                  updatedAt: Date.now()
              }
            : item
    );

    saveEntries(updatedEntries);

    return {
        entries: updatedEntries
    };
}