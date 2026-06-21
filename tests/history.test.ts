import { describe, it, expect, beforeEach } from "vitest";
import { DeckHistory, type StorageLike } from "../src/history";

const ID = (n: number) => `vid00000${String(n).padStart(3, "0")}`.slice(0, 11);

/** In-memory Storage backend, shared across instances in a test. */
function memoryStorage(): StorageLike {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      m.set(k, v);
    },
  };
}

describe("DeckHistory", () => {
  let store: StorageLike;
  beforeEach(() => {
    store = memoryStorage();
  });

  it("starts empty", () => {
    expect(new DeckHistory("left", store).list()).toEqual([]);
  });

  it("adds newest-first and falls back to id for empty title", () => {
    const h = new DeckHistory("left", store);
    h.add(ID(1), "First");
    h.add(ID(2), "");
    expect(h.list()).toEqual([
      { id: ID(2), title: ID(2) },
      { id: ID(1), title: "First" },
    ]);
  });

  it("dedupes by id with move-to-top", () => {
    const h = new DeckHistory("right", store);
    h.add(ID(1), "A");
    h.add(ID(2), "B");
    h.add(ID(1), "A again");
    expect(h.list().map((e) => e.id)).toEqual([ID(1), ID(2)]);
    expect(h.list().length).toBe(2);
  });

  it("caps at 12 entries", () => {
    const h = new DeckHistory("left", store);
    for (let i = 0; i < 20; i++) h.add(ID(i), `t${i}`);
    expect(h.list().length).toBe(12);
    expect(h.list()[0]!.id).toBe(ID(19));
  });

  it("persists across instances via shared storage", () => {
    new DeckHistory("left", store).add(ID(1), "Kept");
    expect(new DeckHistory("left", store).list()).toEqual([{ id: ID(1), title: "Kept" }]);
  });

  it("keeps left and right separate", () => {
    new DeckHistory("left", store).add(ID(1), "L");
    new DeckHistory("right", store).add(ID(2), "R");
    expect(new DeckHistory("left", store).list().map((e) => e.id)).toEqual([ID(1)]);
    expect(new DeckHistory("right", store).list().map((e) => e.id)).toEqual([ID(2)]);
  });

  it("ignores corrupt stored JSON", () => {
    store.setItem("mix.history.v1.left", "{not json");
    expect(new DeckHistory("left", store).list()).toEqual([]);
  });

  it("filters out malformed stored entries", () => {
    store.setItem(
      "mix.history.v1.left",
      JSON.stringify([{ id: ID(1), title: "ok" }, { nope: true }, 42]),
    );
    expect(new DeckHistory("left", store).list()).toEqual([{ id: ID(1), title: "ok" }]);
  });

  it("degrades to in-memory when storage is unavailable", () => {
    const h = new DeckHistory("left", null);
    h.add(ID(1), "still works");
    expect(h.list()).toEqual([{ id: ID(1), title: "still works" }]);
  });
});
