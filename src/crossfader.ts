/**
 * The crossfader law. Equal-power so total perceived loudness stays roughly
 * constant across the slider's travel: both decks sit at ~71% at centre, not
 * 50%. See CONTEXT.md (Crossfader) and ADR / PLAN.md.
 */

export function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0.5;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

export interface Gains {
  /** 0..1 linear gain for the left deck. */
  left: number;
  /** 0..1 linear gain for the right deck. */
  right: number;
}

/** Equal-power gains for a crossfader position x in [0, 1]. */
export function equalPowerGains(x: number): Gains {
  const c = clamp01(x);
  return {
    left: Math.cos((c * Math.PI) / 2),
    right: Math.sin((c * Math.PI) / 2),
  };
}

/** Map a 0..1 gain to the integer 0..100 the YouTube IFrame API expects. */
export function gainToVolume(gain: number): number {
  const g = gain < 0 ? 0 : gain > 1 ? 1 : gain;
  return Math.round(g * 100);
}

/** Convenience: the two integer volumes for a crossfader position. */
export function volumesFor(x: number): { left: number; right: number } {
  const g = equalPowerGains(x);
  return { left: gainToVolume(g.left), right: gainToVolume(g.right) };
}
