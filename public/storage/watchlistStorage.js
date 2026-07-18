import { ERROR_MESSAGES } from "../shared/errors.js";

const WATCHLISTS_STORAGE_KEY =
    "lexium.watchlists.v1";

export function loadWatchlists(defaultWatchlists) {

    try {

        const stored = JSON.parse(
            localStorage.getItem(
                WATCHLISTS_STORAGE_KEY
            ) || "[]"
        );

        if (Array.isArray(stored) && stored.length) {
            return stored;
        }

    } catch (err) {
        console.error(
            "Failed to load watchlists",
            err
        );
    }

    return defaultWatchlists;
}

export function saveWatchlists(watchlists) {
    try {
        localStorage.setItem(
            WATCHLISTS_STORAGE_KEY,
            JSON.stringify(watchlists)
        );
    } catch (error) {
        console.error("Failed to save watchlists to localStorage:", error);
        throw new Error(ERROR_MESSAGES.SAVE_FAILED);
    }
}