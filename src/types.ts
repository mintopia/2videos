/** Which side of the mix a deck is on. Left is always cyan, right is always red. */
export type DeckSide = "left" | "right";

/**
 * The single state a deck is in at any moment. Transport, the crossfader, and
 * history all gate on these. See CONTEXT.md and DESIGN-BRIEF.md.
 */
export type DeckState =
  | "empty" // no video loaded; shows the paste prompt
  | "cued" // loaded but not playing (cueVideoById); ready to play
  | "playing"
  | "buffering" // transient; player is fetching during cue/play/seek
  | "paused"
  | "ended"
  | "errored" // load/playback failed; shows a per-deck message
  | "autoplay-blocked"; // the browser blocked scripted playback

/** A single remembered video in a deck's history. */
export interface HistoryEntry {
  id: string;
  title: string;
}

/** The full shareable mix state carried in the URL. */
export interface MixState {
  left: string | null;
  right: string | null;
  /** Crossfader position, 0 (full left) .. 1 (full right). */
  x: number;
}
