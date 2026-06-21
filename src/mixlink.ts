/**
 * The mix link: the shareable URL state. Encodes the two video IDs and the
 * crossfader position as `l`, `r`, `x`. Strictly validated on the way in so a
 * stale or hostile URL can't poison the app, and canonicalised so junk params
 * never survive into a copied link. See PLAN.md (Mix link) and CONTEXT.md.
 */
import type { MixState } from "./types";
import { clamp01 } from "./crossfader";

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

function cleanId(value: string | null): string | null {
  return value && ID_RE.test(value) ? value : null;
}

/** Parse a query string (e.g. `location.search`) into a validated MixState. */
export function parseMix(search: string): MixState {
  const params = new URLSearchParams(search);
  // URLSearchParams.get returns the first value, so duplicate params are safe.
  const xRaw = params.get("x");
  const xNum = xRaw === null ? 0.5 : Number.parseFloat(xRaw);
  return {
    left: cleanId(params.get("l")),
    right: cleanId(params.get("r")),
    x: clamp01(xNum),
  };
}

/** Build the canonical query string for a mix. Empty when there's nothing to share. */
export function encodeMix(state: MixState): string {
  const params = new URLSearchParams();
  if (state.left) params.set("l", state.left);
  if (state.right) params.set("r", state.right);
  // Only carry x when it's been moved off centre, to keep links tidy.
  const x = clamp01(state.x);
  if (Math.abs(x - 0.5) > 0.001) params.set("x", x.toFixed(3).replace(/0+$/, "").replace(/\.$/, ""));
  const q = params.toString();
  return q ? "?" + q : "";
}

/** The absolute canonical URL for a mix, given the current origin + path. */
export function mixUrl(state: MixState, origin: string, pathname: string): string {
  return origin + pathname + encodeMix(state);
}
