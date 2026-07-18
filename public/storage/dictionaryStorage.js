import { ERROR_MESSAGES } from "../shared/errors.js";

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
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(entries)
        );
    } catch {
        throw new Error(ERROR_MESSAGES.SAVE_FAILED);
    }
}