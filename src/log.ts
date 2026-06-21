/**
 * Dev-only structured logging. Gated on a `?debug` query flag or a localStorage
 * toggle, so production stays quiet. See PLAN.md (Observability).
 */
let enabled = false;
try {
  enabled =
    new URLSearchParams(location.search).has("debug") ||
    globalThis.localStorage?.getItem("mix.debug") === "1";
} catch {
  enabled = false;
}

export function log(event: string, detail?: unknown): void {
  if (!enabled) return;
  if (detail === undefined) console.info(`[mix] ${event}`);
  else console.info(`[mix] ${event}`, detail);
}
