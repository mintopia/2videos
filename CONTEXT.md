# Context

The ubiquitous language for this project. Glossary only — no implementation details.

## Glossary

### Deck
One of the two YouTube videos in the mix. There are exactly two: the **left deck** and the **right deck**. Each deck loads and plays one YouTube video.

### Crossfader
The slider that sets the audio balance between the two decks. Both decks play simultaneously; the crossfader controls their *relative* volume. Full left = only the left deck is audible, full right = only the right deck is audible, centre = both audible. Moving the crossfader never starts, stops, or seeks a deck — it only changes how loud each one is. The crossfader follows an **equal-power** law: total perceived loudness stays roughly constant across its travel (both decks sit at ~71%, not 50%, at centre). It defaults to centre.

### Mix
The combined audible result of both decks playing at once with the crossfader applied. The thing the user is creating.

### Mix link
The shareable URL that encodes the **current** mix: the two decks' video IDs and the crossfader position. Opening a mix link restores that setup. It does *not* encode live playback positions (those are transient). This is the only thing that persists in the URL.

### Deck history
A per-deck list of previously loaded videos, kept in the browser's local storage (not in the URL, not shared). Each deck shows its own history so the user can quickly re-load a video they used before. History is local to the browser and survives reloads.

### Transport
The play / pause / seek controls. Each deck has its **own** transport (independent — the two videos are not kept in sync; the user offsets them by hand). There is also one **master transport**: a single play/pause that acts on both decks at once for convenience. Seeking is per-deck only.
