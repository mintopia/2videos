import "./styles.css";
import type { DeckSide, DeckState, MixState } from "./types";
import { parseVideoId } from "./parse";
import { volumesFor } from "./crossfader";
import { parseMix, encodeMix, mixUrl } from "./mixlink";
import { DeckHistory } from "./history";
import { Deck, loadYouTubeApi } from "./youtube";
import { log } from "./log";

const STATUS_LABEL: Record<DeckState, string> = {
  empty: "Empty",
  cued: "Cued",
  playing: "Playing",
  buffering: "Buffering…",
  paused: "Paused",
  ended: "Ended",
  errored: "Error",
  "autoplay-blocked": "Blocked",
};

function must<T extends Element>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`missing element: ${sel}`);
  return el;
}

interface DeckHooks {
  onMixChange(): void;
  onStateChange(): void;
}

class DeckController {
  readonly deck: Deck;
  private currentId: string | null = null;
  private readonly history: DeckHistory;
  private flashTimer = 0;

  private readonly root: HTMLElement;
  private readonly statusEl: HTMLElement;
  private readonly errorEl: HTMLElement;
  private readonly blockedEl: HTMLButtonElement;
  private readonly urlEl: HTMLInputElement;
  private readonly formEl: HTMLFormElement;
  private readonly playEl: HTMLButtonElement;
  private readonly recentsEl: HTMLDetailsElement;
  private readonly recentsListEl: HTMLElement;

  constructor(
    readonly side: DeckSide,
    private readonly hooks: DeckHooks,
  ) {
    this.history = new DeckHistory(side);
    this.root = must<HTMLElement>(document, `.deck[data-side="${side}"]`);
    this.statusEl = must(this.root, "[data-role=status]");
    this.errorEl = must(this.root, "[data-role=error]");
    this.blockedEl = must(this.root, "[data-role=blocked]");
    this.urlEl = must(this.root, "[data-role=url]");
    this.formEl = must(this.root, "[data-role=form]");
    this.playEl = must(this.root, "[data-role=play]");
    this.recentsEl = must(this.root, "[data-role=recents]");
    this.recentsListEl = must(this.root, "[data-role=recents-list]");

    this.deck = new Deck(side, `player-${side}`, {
      onState: (s) => this.renderState(s),
      onIdentified: (id, title) => this.onIdentified(id, title),
      onError: (msg) => {
        this.errorEl.textContent = msg;
      },
    });

    this.formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submit(this.urlEl.value);
    });
    this.playEl.addEventListener("click", () => this.togglePlay());
    this.blockedEl.addEventListener("click", () => this.deck.play());

    this.renderRecents();
  }

  initPlayer(api: typeof YT, origin: string): void {
    this.deck.init(api, origin);
  }

  getId(): string | null {
    return this.currentId;
  }

  cue(id: string): void {
    this.clearInvalid();
    // Set currentId BEFORE cueing: deck.cue() fires the "cued" state callback
    // synchronously, and renderState() reads currentId to enable Play. Setting
    // it after would leave Play disabled (and a re-cue keeps state="cued", so
    // the callback never fires again to correct it).
    this.setId(id);
    this.deck.cue(id);
    this.urlEl.value = "";
  }

  private setId(id: string | null): void {
    this.currentId = id;
    this.hooks.onMixChange();
  }

  private submit(raw: string): void {
    const result = parseVideoId(raw);
    if (!result.ok) {
      this.showParseError(result.error);
      return;
    }
    this.cue(result.id);
  }

  private showParseError(message: string): void {
    // Don't nuke a deck that already has a working video; only take over the
    // screen when it's empty. Always flag the input.
    if (this.currentId === null) {
      this.errorEl.textContent = message;
      this.root.dataset["state"] = "errored";
    }
    this.urlEl.classList.add("invalid");
    this.urlEl.setAttribute("aria-invalid", "true");
    this.statusEl.textContent = "Bad link";
    window.clearTimeout(this.flashTimer);
    this.flashTimer = window.setTimeout(() => this.clearInvalid(), 2600);
    log(`parse:reject:${this.side}`, message);
  }

  private clearInvalid(): void {
    this.urlEl.classList.remove("invalid");
    this.urlEl.removeAttribute("aria-invalid");
    if (this.currentId !== null) this.statusEl.textContent = STATUS_LABEL[this.deck.getState()];
  }

  private togglePlay(): void {
    if (this.deck.getState() === "playing") this.deck.pause();
    else this.deck.play();
  }

  private renderState(state: DeckState): void {
    this.root.dataset["state"] = state;
    this.statusEl.textContent = STATUS_LABEL[state];
    const playable = this.currentId !== null && state !== "errored";
    this.playEl.disabled = !playable;
    this.playEl.textContent = state === "playing" ? "⏸ Pause" : "▶ Play";
    this.hooks.onStateChange();
  }

  private onIdentified(id: string, title: string): void {
    this.history.add(id, title);
    this.renderRecents();
  }

  private renderRecents(): void {
    const items = this.history.list();
    this.recentsEl.hidden = items.length === 0;
    const nodes = items.map((entry) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = entry.title; // text-safe: never innerHTML
      button.title = entry.title;
      button.addEventListener("click", () => {
        this.cue(entry.id);
        this.recentsEl.removeAttribute("open");
      });
      li.appendChild(button);
      return li;
    });
    this.recentsListEl.replaceChildren(...nodes);
  }
}

function main(): void {
  const fader = must<HTMLInputElement>(document, "#fader");
  const master = must<HTMLButtonElement>(document, "#master");
  const copyBtn = must<HTMLButtonElement>(document, "#copy");
  const copyMsg = must<HTMLOutputElement>(document, "#copy-msg");
  const copyFallback = must<HTMLInputElement>(document, "#copy-fallback");
  const gainLeftEl = must<HTMLElement>(document, "[data-role=gain-left]");
  const gainRightEl = must<HTMLElement>(document, "[data-role=gain-right]");

  let mixTimer = 0;
  let rafPending = false;
  let copyTimer = 0;

  const currentMix = (): MixState => ({
    left: left.getId(),
    right: right.getId(),
    x: Number(fader.value) / 1000,
  });

  const writeMixUrl = (): void => {
    const url = location.pathname + encodeMix(currentMix());
    history.replaceState(null, "", url);
  };

  const scheduleMixUrl = (): void => {
    window.clearTimeout(mixTimer);
    mixTimer = window.setTimeout(writeMixUrl, 250);
  };

  const applyFader = (): void => {
    const x = Number(fader.value) / 1000;
    const v = volumesFor(x);
    left.deck.setVolume(v.left);
    right.deck.setVolume(v.right);
    gainLeftEl.textContent = `${v.left}%`;
    gainRightEl.textContent = `${v.right}%`;
    fader.setAttribute("aria-valuetext", `left ${v.left}%, right ${v.right}%`);
  };

  const updateMaster = (): void => {
    const anyPlaying =
      left.deck.getState() === "playing" || right.deck.getState() === "playing";
    master.textContent = anyPlaying ? "⏸ Pause both" : "▶ Play both";
  };

  const hooks: DeckHooks = {
    onMixChange: scheduleMixUrl,
    onStateChange: updateMaster,
  };

  const left = new DeckController("left", hooks);
  const right = new DeckController("right", hooks);

  // Restore from the mix link, then canonicalise the URL.
  const initial = parseMix(location.search);
  fader.value = String(Math.round(initial.x * 1000));
  applyFader();
  if (initial.left) left.cue(initial.left);
  if (initial.right) right.cue(initial.right);
  writeMixUrl();
  updateMaster();

  fader.addEventListener("input", () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        applyFader();
      });
    }
    scheduleMixUrl();
  });

  master.addEventListener("click", () => {
    const anyPlaying =
      left.deck.getState() === "playing" || right.deck.getState() === "playing";
    if (anyPlaying) {
      left.deck.pause();
      right.deck.pause();
    } else {
      left.deck.playOrReplay();
      right.deck.playOrReplay();
    }
  });

  const flashCopyMsg = (text: string): void => {
    copyMsg.textContent = text;
    copyMsg.hidden = false;
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => {
      copyMsg.hidden = true;
    }, 4000);
  };

  copyBtn.addEventListener("click", async () => {
    const url = mixUrl(currentMix(), location.origin, location.pathname);
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        copyFallback.hidden = true;
        flashCopyMsg("Copied. Go paste it.");
        return;
      } catch {
        /* fall through to manual */
      }
    }
    copyFallback.value = url;
    copyFallback.hidden = false;
    copyFallback.focus();
    copyFallback.select();
    flashCopyMsg("Couldn't copy. Grab it yourself ↓");
  });

  loadYouTubeApi()
    .then((api) => {
      const origin = location.origin;
      left.initPlayer(api, origin);
      right.initPlayer(api, origin);
      log("decks:init");
    })
    .catch((err) => log("yt:load-failed", err));
}

main();
