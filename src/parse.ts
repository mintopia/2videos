/**
 * Turn whatever the user pasted into a YouTube video ID, or a blunt error.
 *
 * Accepts (per DESIGN-BRIEF.md / PLAN.md):
 *   - a bare 11-char ID
 *   - watch URLs:        youtube.com/watch?v=<id>  (extra params ignored)
 *   - short URLs:        youtu.be/<id>
 *   - shorts / embed:    youtube.com/shorts/<id>, youtube.com/embed/<id>
 * Hosts are restricted to a fixed allowlist and normalised for case.
 * Protocol-relative URLs are accepted (assumed https).
 */

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

const ALLOWED_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
]);

export type ParseResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function valid(id: string): boolean {
  return ID_RE.test(id);
}

export function parseVideoId(raw: string): ParseResult {
  const input = raw.trim();
  if (!input) {
    return { ok: false, error: "Paste a YouTube link or video ID." };
  }

  // Bare ID, the happy fast path.
  if (valid(input)) {
    return { ok: true, id: input };
  }

  // Try to read it as a URL. Add a protocol if it's missing or protocol-relative.
  let url: URL;
  try {
    const withProto = /^https?:\/\//i.test(input)
      ? input
      : "https://" + input.replace(/^\/\//, "");
    url = new URL(withProto);
  } catch {
    return { ok: false, error: "That doesn't look like a YouTube link." };
  }

  const host = url.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(host)) {
    return { ok: false, error: "Only YouTube links work here." };
  }

  // youtu.be/<id>
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0] ?? "";
    return valid(id)
      ? { ok: true, id }
      : { ok: false, error: "No video ID in that link." };
  }

  // youtube.com/watch?v=<id>
  const v = url.searchParams.get("v");
  if (v) {
    return valid(v)
      ? { ok: true, id: v }
      : { ok: false, error: "That video ID looks wrong." };
  }

  // youtube.com/shorts/<id>, /embed/<id>, /v/<id>, /live/<id>
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length >= 2 && ["shorts", "embed", "v", "live"].includes(parts[0]!)) {
    const id = parts[1]!;
    return valid(id)
      ? { ok: true, id }
      : { ok: false, error: "No video ID in that link." };
  }

  // A playlist-only or channel URL with no single video.
  return { ok: false, error: "That link has no single video in it." };
}
