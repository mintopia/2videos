# Design Brief: Two videos and a motherfucking slider
_Produced via `$impeccable shape`. Confirmed by Jess. Register: product (PRODUCT.md). Pairs with PLAN.md / CONTEXT.md._

## 1. Feature summary
A single-screen, zero-backend desktop web tool that loads two YouTube videos (left deck, right deck), plays both at once, and rides an equal-power crossfader between their audio. Shareable via mix link; each deck remembers recent videos. For someone with two URLs who wants to be blending audio within ten seconds, for the fun of dragging the slider.

## 2. Primary user action
Drag the crossfader. Everything else (paste, cue, play) exists to get the user to that one satisfying interaction.

## 3. Design direction
- **Color strategy: Full palette** (chosen via coded probe B over a "one scream" alternative). Two named riso roles:
  - left deck = cyan-blue `oklch(0.70 0.16 230)`
  - right deck = red `oklch(0.69 0.21 30)`
  - Used for deck identity (frames, dots, labels), the crossfader track (a blend between the two), and the live gain readouts. Everything else neutral so two loud colors stay legible.
- **Theme: dark.** Scene: "someone alone in a dim room at night, two video thumbnails glowing, dragging a fat slider back and forth for the hell of it." Warm-tinted near-black canvas (never pure black), riso grain overlay.
- **Anchors:** Cards Against Humanity (blunt oversized wordmark, deadpan copy), Teenage Engineering (monospace labels, utilitarian grid, primary-color accents), punk/riso gig flyer (condensed poster type, grain, slight misregistration).
- Clears all three PRODUCT.md anti-references (no SaaS chrome, no corporate-safe, no DAW density) and all impeccable absolute bans (no gradient text, no side-stripe borders, no glassmorphism).

## 4. Scope
Production-ready. One screen, fully interactive, wired to the locked PLAN.md (YouTube IFrame API). Polish until it ships.

## 5. Layout strategy
Vertical flow on one desktop screen: blunt masthead wordmark → two decks side by side (16:9, color-framed by side) → **crossfader console spanning full width as the hero** directly below (visually heaviest element) → master transport + copy-link + the honest desktop-only note. Per-deck recents sit quietly under each deck input. Asymmetric spacing (generous around the fader, tight in deck chrome) so the eye lands on the slider.

## 6. Key states
- **Per deck:** empty (paste prompt) · cued · playing · buffering · paused · ended · errored (bad/unplayable/embed-disabled, blunt human message) · autoplay-blocked.
- **Crossfader:** live equal-power gain readout in each deck's color.
- **Mix link:** copy success (inline confirm) · copy failure (reveal selectable URL).
- **History:** empty vs populated, per deck.
- **Restored-from-link:** both decks cued, fader at saved position.
- **Compact window:** below minimum desktop viewport, a blocking "open me wider" message.

## 7. Interaction model
Paste/enter → cue (never auto-plays). **Transport: custom play/pause per deck + master "play both"; seeking uses YouTube's native iframe timeline.** Drag fader → equal-power `setVolume` on both, gain readouts update, URL updates live (debounced `replaceState`). Copy link reads canonical URL. Click a recent → cues it. Fully keyboard-operable (native `<input type=range>` + real buttons), focus rings in the accent color, respects `prefers-reduced-motion`.

## 8. Content requirements
Blunt, swears-a-little voice. Wordmark: "Two videos and a motherfucking slider." Error copy with humor, not stack traces. Desktop-only / no-iPhone note stated plainly. Empty deck prompt ("paste a youtube link"). All dynamic text (titles, IDs, errors) inserted via `textContent` only.

## 9. Recommended impeccable references for build
`layout` (fader-as-hero rhythm), `typeset` (Anton / Space Mono hierarchy), `colorize` (two-role discipline), `animate` (fader drag + state transitions, reduced-motion), `harden` (eight deck states + storage degrade), `clarify` (error/empty copy).

## 10. Resolved decisions
- **Transport:** custom play/pause + master, native YouTube scrub for seeking. (Was open; confirmed.)
- **Color-blind safety:** left/right is carried redundantly by L/R labels, fader position, and text gain readouts, so color is never the sole signal. Acceptable under the project's light-touch a11y bar.
- **History placement:** inline under each deck input (recents), kept quiet. (Implementer may choose dropdown vs strip.)
