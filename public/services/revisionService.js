export function startLetterRevision(letter) {

    return {
        revisionLetter: letter,
        revisionWatchlistId: null,
        revisionIndex: 0,
        revisionShuffled: false,
        meaningRevealed: false
    };

}

export function buildRevisionDeck({
    entries,
    watchlists,
    revisionDeck,
    revisionWatchlistId,
    revisionLetter,
    revisionIndex,
    revisionShuffled,
    sortedEntries,
    statusRank
}) {

    const currentIds =
        revisionDeck
            .map(entry => entry.id)
            .sort()
            .join("|");

    let targetEntries = entries;

    if (revisionWatchlistId) {

        const watchlist =
            watchlists.find(
                w => w.id === revisionWatchlistId
            );

        if (watchlist) {
            targetEntries = entries.filter(
                entry => watchlist.wordIds.includes(entry.id)
            );
        }

    } else if (revisionLetter) {

        targetEntries = entries.filter(
            entry =>
                entry.word.charAt(0).toUpperCase() === revisionLetter
        );

    }

    const nextIds =
        targetEntries
            .map(entry => entry.id)
            .sort()
            .join("|");

    if (
        revisionShuffled &&
        currentIds === nextIds
    ) {

        return {
            revisionDeck,
            revisionIndex: Math.min(
                revisionIndex,
                Math.max(revisionDeck.length - 1, 0)
            )
        };

    }

    const deck =
        sortedEntries(targetEntries)
            .sort(
                (a, b) =>
                    statusRank(a.status) -
                    statusRank(b.status)
            );

    return {
        revisionDeck: deck,
        revisionIndex: Math.min(
            revisionIndex,
            Math.max(deck.length - 1, 0)
        )
    };

}

export function shuffleDeck(deck) {

    return {
        deck: [...deck].sort(() => Math.random() - 0.5),
        index: 0,
        shuffled: true,
        revealed: false
    };

}