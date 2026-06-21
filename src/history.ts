/**
 * Per-deck history of previously loaded videos. Local to the browser, never
 * shared. Capped, deduplicated (move-to-top), versioned key. All storage access
 * is wrapped so private mode / quota / corrupt JSON degrades to in-memory rather
 * than breaking boot. See PLAN.md (Deck history) and CONTEXT.md.
 */
import type { DeckSide, HistoryEntry } from "./types";

const CAP = 12;
const KEY_PREFIX = "mix.history.v1.";

/** The slice of the Storage API we actually use. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Real localStorage if it works, otherwise null (caller degrades to memory). */
export function defaultStorage(): StorageLike | null {
  try {
    const ls = globalThis.localStorage;
    const probe = "__mix_probe__";
    ls.setItem(probe, "1");
    ls.getItem(probe);
    return ls;
  } catch {
    return null;
  }
}

function keyFor(side: DeckSide): string {
  return KEY_PREFIX + side;
}

function isEntry(value: unknown): value is HistoryEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as HistoryEntry).id === "string" &&
    typeof (value as HistoryEntry).title === "string"
  );
}

export class DeckHistory {
  private memory: HistoryEntry[] = [];
  private storage: StorageLike | null;

  constructor(
    private readonly side: DeckSide,
    storage: StorageLike | null = defaultStorage(),
  ) {
    this.storage = storage;
    this.memory = this.read();
  }

  list(): readonly HistoryEntry[] {
    return this.memory;
  }

  /** Record a video. Newest first, deduped by id, capped. Returns the new list. */
  add(id: string, title: string): readonly HistoryEntry[] {
    const entry: HistoryEntry = { id, title: title || id };
    const next = [entry, ...this.memory.filter((e) => e.id !== id)].slice(0, CAP);
    this.memory = next;
    this.write(next);
    return next;
  }

  clear(): void {
    this.memory = [];
    this.write([]);
  }

  private read(): HistoryEntry[] {
    if (!this.storage) return this.memory;
    try {
      const raw = this.storage.getItem(keyFor(this.side));
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isEntry).slice(0, CAP);
    } catch {
      this.storage = null;
      return this.memory;
    }
  }

  private write(entries: HistoryEntry[]): void {
    if (!this.storage) return;
    try {
      this.storage.setItem(keyFor(this.side), JSON.stringify(entries));
    } catch {
      // Quota, private mode, disabled storage: keep working from memory.
      this.storage = null;
    }
  }
}
