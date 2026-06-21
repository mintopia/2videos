# Plan Review Log: Two YouTube videos and a crossfader (audio mixing SPA)
Act 1 (grill-with-docs) complete — plan locked, CONTEXT.md/ADRs updated. MAX_ROUNDS=5.

## Round 1 — Codex
Verdict: REVISE. Findings:
1. `loadVideoById` auto-plays — wrong default for restore/history; use `cueVideoById`, `playVideo` only on gesture.
2. Missing `onAutoplayBlocked` handling per deck.
3. Error codes incomplete — add `2`, `5`, `153` + unknown fallback (not just 100/101/150).
4. Missing `playerVars.origin` security parameter.
5. Phantom `ADR-0008` reference for Cloudflare Pages — only 0001/0002 exist.
6. No explicit deck state machine (empty/cued/playing/paused/ended/errored/autoplay-blocked).
7. Master transport underspecified for empty/errored/buffering/blocked/ended decks.
8. URL parser contract undefined (youtu.be, /shorts/, /embed/, playlists, timestamps, malformed IDs, dup params).
9. Mix-link `x` has no validity contract — clamp to [0,1], default 0.5 on invalid.
10. `localStorage` assumed always available — wrap in try/catch, degrade to in-memory.
11. Deck history unbounded + duplicates — cap, move-to-top, version the key.
12. Title capture timing imprecise — update on first reliable `onStateChange`, ID fallback.
13. Initial centre volume not applied until first slider input — apply on `onReady` and after each cue.
14. Min viewport/player size not defined — define minimum, blocking compact-window state.
15. No observability — add dev-only structured console events.
16. Custom domain creates DNS dependency — v1 acceptance = static build on any host; domain is a separate task.

### Claude's response
Accepted all 16 — all valid, cheap, and scope-preserving. Revised PLAN.md:
- Loading now uses `cueVideoById` for restore/history/input; `playVideo` only on explicit transport gestures (#1).
- Added per-deck deck-state machine: `empty | cued | playing | paused | ended | errored | autoplay-blocked` — transport/crossfader/history gate on it (#6, #7).
- Error handling maps `2,5,100,101,150,153` + unknown fallback; added `onAutoplayBlocked` state (#2, #3).
- Added `playerVars.origin = window.location.origin` (#4).
- Removed phantom ADR-0008 ref; hosting kept as a decision, no ADR (low reversal cost, no coupling) (#5).
- Defined URL parser contract (accepted forms, strict 11-char ID validation, ignored params, parse errors) (#8).
- `x` parsed as finite, clamped [0,1], default 0.5 (#9).
- All storage access wrapped in try/catch with in-memory degrade; history capped (12), deduped move-to-top, versioned key (#10, #11).
- History title set on first reliable `onStateChange`, ID fallback (#12).
- Crossfader volume applied on each `onReady` and after each successful cue (#13).
- Minimum viewport defined with a blocking compact-window state (#14).
- Dev-only structured logging for API load/ready/cue/error/blocked/storage/copy-link (#15).
- v1 acceptance reframed to "static build runs locally and on any static host"; custom domain is a separate deployment task (#16).

## Round 2 — Codex
Verdict: REVISE. Prior 16 confirmed addressed. New findings:
1. Deck state machine omits YouTube `BUFFERING`; map all `YT.PlayerState` values.
2. `ended` decks skipped by master play — define replay (`seekTo(0)`+`playVideo`) or document.
3. Remote titles / user IDs rendered to DOM — require text-safe insertion (no `innerHTML`). [XSS]
4. Mix-link contract ambiguous — live `replaceState` vs copy-time construction.
5. Clipboard-copy failure has no user recovery path — show selectable URL fallback.
6. Parser host set undefined — canonicalize `m.youtube.com`, `youtube-nocookie.com`, protocol-relative, case.
7. History "first reliable onStateChange" still vague — precise trigger + `lastRecordedId` guard.
8. Invalid mix-link params may persist in URL and poison copied links — canonicalize query after parse.

### Claude's response
Accepted all 8 — all valid hardening (incl. a real XSS vector, #3). Revised PLAN.md:
- Full `YT.PlayerState` → deck-state mapping incl. `buffering` transient substate (#1).
- Master play includes `ended` decks via `seekTo(0)` then `playVideo` (replay semantics) (#2).
- Security rule: all dynamic text (titles, IDs, parse errors, history rows) inserted via `textContent`/attribute APIs, never `innerHTML` (#3).
- Mix link defined: live `history.replaceState` (debounced) on deck/crossfader change; copy reads the current canonical URL (#4).
- Clipboard failure shows the URL in a selectable field as fallback (#5).
- Defined allowed host set + `URL`-based host normalization (casing, protocol-relative) (#6).
- History trigger made precise: first transition to `CUED` or `PLAYING` for a new current ID, guarded by `lastRecordedId` (#7).
- After parsing a mix link, canonicalize the query to only valid `l`, `r`, clamped `x` via `replaceState` (#8).

## Round 3 — Codex
Verdict: APPROVED. All prior findings confirmed addressed; no new blocking flaws. Remaining risk is ordinary YouTube IFrame async implementation risk, already covered by readiness guards + queued restore/cue. **Converged after 3 rounds.**
