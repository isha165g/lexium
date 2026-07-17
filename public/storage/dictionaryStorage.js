const STORAGE_KEY = "lexium.dictionary.v1";

export function loadEntries(defaultEntries = []) {
    try {
        const stored = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(stored) && stored.length
            ? stored
            : defaultEntries;

    } catch {
        return defaultEntries;
    }
}

export function saveEntries(entries) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entries)
    );
}