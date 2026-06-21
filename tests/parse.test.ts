import { describe, it, expect } from "vitest";
import { parseVideoId } from "../src/parse";

const ID = "dQw4w9WgXcQ";

describe("parseVideoId", () => {
  it("accepts a bare 11-char id", () => {
    expect(parseVideoId(ID)).toEqual({ ok: true, id: ID });
  });

  it("trims surrounding whitespace", () => {
    expect(parseVideoId(`  ${ID}  `)).toEqual({ ok: true, id: ID });
  });

  it("reads a standard watch URL and ignores extra params", () => {
    expect(
      parseVideoId(`https://www.youtube.com/watch?v=${ID}&t=42s&list=PLxyz`),
    ).toEqual({ ok: true, id: ID });
  });

  it("reads a youtu.be short URL", () => {
    expect(parseVideoId(`https://youtu.be/${ID}?t=10`)).toEqual({ ok: true, id: ID });
  });

  it("reads shorts and embed URLs", () => {
    expect(parseVideoId(`https://www.youtube.com/shorts/${ID}`)).toEqual({ ok: true, id: ID });
    expect(parseVideoId(`https://www.youtube.com/embed/${ID}`)).toEqual({ ok: true, id: ID });
  });

  it("accepts protocol-relative and bare-host URLs", () => {
    expect(parseVideoId(`//youtu.be/${ID}`)).toEqual({ ok: true, id: ID });
    expect(parseVideoId(`youtube.com/watch?v=${ID}`)).toEqual({ ok: true, id: ID });
  });

  it("normalises host casing and accepts m./music. hosts", () => {
    expect(parseVideoId(`https://M.YouTube.com/watch?v=${ID}`)).toEqual({ ok: true, id: ID });
    expect(parseVideoId(`https://music.youtube.com/watch?v=${ID}`)).toEqual({ ok: true, id: ID });
  });

  it("rejects empty input", () => {
    expect(parseVideoId("   ").ok).toBe(false);
  });

  it("rejects non-YouTube hosts", () => {
    expect(parseVideoId("https://vimeo.com/12345").ok).toBe(false);
    expect(parseVideoId(`https://evil.com/watch?v=${ID}`).ok).toBe(false);
  });

  it("rejects a malformed id (wrong length / charset)", () => {
    expect(parseVideoId("short").ok).toBe(false);
    expect(parseVideoId("https://youtu.be/twelvecharss!").ok).toBe(false);
  });

  it("rejects a playlist-only URL", () => {
    expect(parseVideoId("https://www.youtube.com/playlist?list=PLabc").ok).toBe(false);
  });
});
