import { saveWatchlists } from "../storage/watchlistStorage.js";

export function createWatchlist({
    watchlists,
    name,
    wordIds = []
}) {

    const cleanName = name.trim();

    if (!cleanName) {
        return {
            success: false,
            message: "Watchlist name cannot be empty."
        };
    }

    if (
        watchlists.some(
            w => w.name.toLowerCase() === cleanName.toLowerCase()
        )
    ) {
        return {
            success: false,
            message: "A watchlist with this name already exists."
        };
    }

    const newWatchlist = {
        id: `watchlist-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: cleanName,
        wordIds: [...wordIds],
        createdAt: Date.now()
    };

    const updatedWatchlists = [
        ...watchlists,
        newWatchlist
    ];

    saveWatchlists(updatedWatchlists);

    return {
        success: true,
        watchlists: updatedWatchlists,
        watchlist: newWatchlist
    };
}

export function renameWatchlist({
    watchlists,
    watchlistId,
    newName
}) {

    const cleanName = newName.trim();

    const current = watchlists.find(
        w => w.id === watchlistId
    );

    if (!current) {
        return {
            success: false,
            message: "Watchlist not found."
        };
    }

    if (!cleanName) {
        return {
            success: false,
            message: "Watchlist name cannot be empty."
        };
    }

    if (
        watchlists.some(
            w =>
                w.id !== watchlistId &&
                w.name.toLowerCase() === cleanName.toLowerCase()
        )
    ) {
        return {
            success: false,
            message: "A watchlist with this name already exists."
        };
    }

    const updatedWatchlists = watchlists.map(w => {

        if (w.id !== watchlistId) return w;

        return {
            ...w,
            name: cleanName
        };

    });

    saveWatchlists(updatedWatchlists);

    return {
        success: true,
        watchlists: updatedWatchlists
    };
}

export function deleteWatchlist({
    watchlists,
    watchlistId
}) {

    const updatedWatchlists = watchlists.filter(
        w => w.id !== watchlistId
    );

    saveWatchlists(updatedWatchlists);

    return updatedWatchlists;
}

export function addWordToWatchlist({
    watchlists,
    wordId,
    watchlistId
}) {

    const updatedWatchlists = watchlists.map(w => {

        if (w.id !== watchlistId) {
            return w;
        }

        if (w.wordIds.includes(wordId)) {
            return w;
        }

        return {
            ...w,
            wordIds: [...w.wordIds, wordId]
        };

    });

    saveWatchlists(updatedWatchlists);

    return updatedWatchlists;
}

export function removeWordFromWatchlist({
    watchlists,
    wordId,
    watchlistId
}) {

    const updatedWatchlists = watchlists.map(w => {

        if (w.id !== watchlistId) {
            return w;
        }

        return {
            ...w,
            wordIds: w.wordIds.filter(
                id => id !== wordId
            )
        };

    });

    saveWatchlists(updatedWatchlists);

    return updatedWatchlists;
}

export function calculateSynonymGroups({
    entries,
    searchQuery = ""
}) {

    const groups = {};

    entries.forEach(entry => {

        const wordLower = entry.word.toLowerCase();

        if (!groups[wordLower]) {
            groups[wordLower] = new Set();
        }

        groups[wordLower].add(entry);

        if (entry.synonyms && Array.isArray(entry.synonyms)) {

            entry.synonyms.forEach(syn => {

                const synonym = syn.trim().toLowerCase();

                if (!synonym) return;

                if (!groups[synonym]) {
                    groups[synonym] = new Set();
                }

                groups[synonym].add(entry);

            });

        }

    });

    const query = searchQuery.trim().toLowerCase();

    const result = [];

    for (const synonym in groups) {

        const words = [...groups[synonym]];

        if (words.length < 2) continue;

        const matches =
            !query ||
            synonym.includes(query) ||
            words.some(
                entry =>
                    entry.word.toLowerCase().includes(query)
            );

        if (!matches) continue;

        result.push({
            synonym,
            words: words.sort((a, b) =>
                a.word.localeCompare(b.word)
            )
        });

    }

    return result.sort(
        (a, b) =>
            b.words.length - a.words.length ||
            a.synonym.localeCompare(b.synonym)
    );
}