# Plan: Two YouTube videos and a crossfader (audio mixing SPA)
_Locked via grill-with-docs — by Claude + Jess. Terms per CONTEXT.md. Hardened via Codex review (round 1)._

## Goal
A single-page, zero-backend web app for mixing the audio of two YouTube videos.
The page shows a **left deck** and a **right deck** (each a YouTube video) and a
**crossfader** between them. When both decks are playing, the crossfader sets
their relative volume on an equal-power law so the user can blend the two audio
sources in real time — "two YouTube videos and a motherfucking slider." A mix is
shareable via a **mix link** and each deck remembers its own **deck history**.

## Deck state machine
Each deck is always in exactly one state. Transport, crossfader, history, and
master transport all gate on these states:

- `empty` — no video loaded (initial). Shows the paste prompt.
- `cued` — a video is loaded but not playing (via `cueVideoById`). Ready to play.
- `playing` — actively playing.
- `buffering` — transient: the player is buffering during cue/play/seek. Treated
  as a busy substate; master transport and UI must not report it as paused/idle.
- `paused` — paused by the user.
- `ended` — reached the end.
- `errored` — load/playback failed (see Error handling). Shows per-deck error.
- `autoplay-blocked` — the browser blocked scripted playback; shows a
  "click play to start" affordance.

Mapping from `YT.PlayerState` via `onStateChange`: `-1 UNSTARTED → cued/empty`
(depending on whether a video is loaded), `0 ENDED → ended`, `1 PLAYING →
playing`, `2 PAUSED → paused`, `3 BUFFERING → buffering`, `5 CUED → cued`.
`onError` → `errored`; `onAutoplayBlocked` → `autoplay-blocked`.

Loading a video always lands in `cued` (never auto-plays). Playback is only ever
started by an explicit user transport gesture.

## Security
All dynamically rendered content — video titles (from `getVideoData().title`),
user-entered IDs, parse-error messages, and history rows — is inserted via
`textContent` / attribute-setter APIs only. **Never `innerHTML`.** Video IDs are
additionally constrained to `[A-Za-z0-9_-]{11}` before use.

## Approach
1. **Project setup** — Vanilla TypeScript + Vite (ADR-0001). Single `index.html`,
   a small set of TS modules, builds to a plain static bundle with no platform
   coupling.
2. **YouTube IFrame API** — Load the IFrame Player API once. Instantiate two
   `YT.Player` instances (left/right). Pass `playerVars.origin =
   window.location.origin` on both for player-control hardening.
3. **Loading a deck** — Per-deck text input. The parser uses the `URL` API and a
   fixed **allowed host set** (case-normalised): `youtube.com`, `www.youtube.com`,
   `m.youtube.com`, `music.youtube.com`, `www.youtube-nocookie.com`, `youtu.be`.
   Protocol-relative URLs are accepted (assume `https`). Accepted forms:
   - `…/watch?v=<id>` (ignoring extra params like `t`, `list`)
   - `youtu.be/<id>`
   - `…/shorts/<id>` and `…/embed/<id>`
   - a bare 11-char video ID (`[A-Za-z0-9_-]{11}`)

   Single parser contract: normalise host casing via `URL`, reject hosts outside
   the allowed set, extract the candidate ID, validate strictly against the
   11-char charset, ignore unrecognised params, reject playlist-only URLs, and
   show a user-visible (text-safe) parse error on failure. A successful parse
   calls **`cueVideoById`** (never `loadVideoById`) → deck enters `cued`. Both
   decks start `empty`.
4. **Transport** — Each deck has its own play/pause (calling `playVideo` /
   `pauseVideo` only on the user's gesture) and seek (native YouTube control).
   One **master transport** play/pause acts on both decks at once. Master *play*
   targets decks in `cued | paused | buffering`, and **also replays `ended` decks**
   via `seekTo(0)` then `playVideo`. `empty | errored | autoplay-blocked` decks
   are skipped and reported inline. Master *pause* targets `playing | buffering`.
   Decks are NOT sync-locked.
5. **Crossfader** — One `<input type="range">` (0..1, default 0.5 = centre). On
   input, compute equal-power gains: `left = cos(x·π/2)`, `right = sin(x·π/2)`,
   map to 0–100, round, and call `setVolume` on each ready player. Throttle to
   animation frames. **Apply the current crossfader volume on each player's
   `onReady` and after every successful cue** so a deck never plays at a stale
   default volume before the first slider move.
6. **Mix link** — State lives in the query string: `l`=left id, `r`=right id,
   `x`=crossfader position. The URL is updated **live** via `history.replaceState`
   (debounced) whenever a deck's video or the crossfader position changes; the
   "copy link" action simply reads the current canonical URL (with a clipboard
   fallback — see below). On load, parse: IDs go through the same strict
   validator (invalid → that deck stays `empty`); `x` is parsed as a finite
   number, clamped to `[0,1]`, default `0.5` on anything invalid
   (`NaN`/negative/huge/duplicate param → take first, then validate). **After
   parsing, canonicalize the query** via `replaceState` to contain only valid
   `l`, `r`, and clamped `x`, so junk/hostile params can't poison subsequent
   copied links. Restored videos are **cued, not played**. Live playback
   positions are NOT encoded.
7. **Deck history** — Record on the **first `onStateChange` transition to `CUED`
   or `PLAYING` for a new current video ID**, guarded by a per-deck
   `lastRecordedId` so buffering/play transitions can't write duplicates. Record
   `{id, title}` (title via `getVideoData().title`, falling back to the ID if
   empty) into a per-deck list in `localStorage` under a **versioned key**
   (e.g. `mix.history.v1.left`). History is capped (12 entries), deduplicated with
   move-to-top on reload, and local-only. All storage reads and writes are wrapped
   in `try/catch`, validate decoded JSON, and **degrade to in-memory** history if
   storage is unavailable/quota'd/corrupt. Clicking an entry **cues** it (does not
   auto-play).
8. **Error handling** — Listen for IFrame `onError`. Map codes: `2` (invalid
   param), `5` (HTML5 player error), `100`/`101`/`150` (not found / embedding
   disabled), `153` (missing referer), plus an **unknown-code fallback**. Each
   sets the deck to `errored` with a clear per-deck message. Also handle
   `onAutoplayBlocked` → `autoplay-blocked` state. The other deck keeps working.
9. **Viewport / desktop-only** — Target desktop (ADR-0002). Define a **minimum
   supported viewport**; below it (or a too-small window), show a blocking
   "open in a larger desktop window" state rather than a broken player layout.
10. **Observability** — Dev-only structured `console` events (gated on a debug
    flag) for: API script load, each player `onReady`, cue/load, errors (with
    code), autoplay-blocked, storage failures, and copy-link failures. No
    third-party analytics. **Copy-link UX:** on clipboard write success, confirm
    inline; on failure (no clipboard permission/API), reveal the URL in a
    pre-selected, read-only text field so the user can copy manually.
11. **Build & deploy** — `npm run build` → static bundle. **v1 acceptance: the
    built bundle runs locally and on any static host.** Deploying to Cloudflare
    Pages and attaching a custom domain under mintopia.net is a **separate
    deployment task**, not a v1 acceptance gate. No Workers, no server.

## Key decisions & tradeoffs
- **Crossfader = the only interpretation that means "mixing"** — both decks play
  at once; slider is a DJ-style balance control, not an A/B switch. (CONTEXT.md.)
- **Cue, don't load-and-play** — `cueVideoById` everywhere except explicit
  transport gestures, so restoring a mix link or clicking history never triggers
  surprise playback or autoplay blocking.
- **Independent transports + master play/pause, NOT locked sync** — true
  sample-accurate sync across two YouTube iframes is fragile (independent
  buffering/drift) and would dominate the effort. User aligns by hand.
- **Equal-power crossfader law** over linear — avoids the perceived-loudness dip
  at centre; matches real mixing gear. One-line formula.
- **Paste URL/ID, no in-app search** — keeps it a static page with no API key,
  quota, or backend. Search is a v2.
- **Vanilla TS + Vite, no framework** — right-sized for two imperative iframe
  players + a slider. See [ADR-0001](docs/adr/0001-vanilla-ts-vite.md).
- **Desktop-only** — iOS Safari ignores programmatic `setVolume`, the whole
  feature. Ads accepted (Premium/adblock); embed-disabled handled per deck. See
  [ADR-0002](docs/adr/0002-desktop-only-target.md).
- **Mix link in URL + deck history in localStorage** — two separate persistence
  mechanisms; URL = shareable current setup, localStorage = private per-deck
  recents. Both strictly validated; storage degrades gracefully. No backend.
- **Cloudflare Pages is the intended host but not coupled** — no ADR (low reversal
  cost, no platform code); any static host works.

## Risks / open questions
- **API readiness race** — guard transport/crossfader so they never act on a
  player before its `onReady`; queue the restore/cue until ready.
- **Crossfader granularity** — `setVolume` is integer 0–100, so fine slider moves
  quantise. Acceptable; not audible in practice.
- **Title availability** — `getVideoData().title` can be briefly empty; mitigated
  by recording on first reliable `onStateChange` with ID fallback.

## Out of scope (v1)
- Per-deck volume trim / individual gain (crossfader is the only volume control).
- More than two decks.
- EQ, filters, effects, tempo/pitch, beat-sync — **technically impossible** with
  YouTube embeds (audio is cross-origin, unreachable by Web Audio), not deferred.
- Recording / exporting the mix (same cross-origin block).
- Loop / playback-speed controls.
- Saved/named mixes, accounts, any backend.
- In-app YouTube search.
- iOS / mobile support and mobile-responsive layout (below the minimum desktop
  viewport, the app shows a blocking message rather than adapting).
