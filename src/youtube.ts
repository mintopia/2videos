/**
 * YouTube IFrame API: a single loader and a Deck wrapper that owns one player
 * and its state machine. Loading always CUES (never auto-plays); playback only
 * happens on an explicit gesture. See PLAN.md and DESIGN-BRIEF.md.
 */
import type { DeckSide, DeckState } from "./types";
import { log } from "./log";

/** Resolve the IFrame Player API once, no matter how many decks ask. */
let apiPromise: Promise<typeof YT> | null = null;

export function loadYouTubeApi(): Promise<typeof YT> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      log("yt:api-ready");
      resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.head.appendChild(tag);
    log("yt:api-loading");
  });
  return apiPromise;
}

export interface DeckCallbacks {
  /** The deck moved to a new state. */
  onState(state: DeckState): void;
  /** A new video has been confirmed cued/playing; good moment to record history. */
  onIdentified(id: string, title: string): void;
  /** A blunt, human message for an errored deck. */
  onError(message: string): void;
}

/** Turn a YouTube IFrame error code into something a person can read. */
function errorMessage(code: number): string {
  switch (code) {
    case 2:
      return "That video link is malformed.";
    case 5:
      return "This one won't play in the browser player.";
    case 100:
      return "That video is gone. Private, deleted, or never existed.";
    case 101:
    case 150:
      return "The owner blocked this video from playing off-site. Pick another.";
    case 153:
      return "YouTube refused the request. Try reloading.";
    default:
      return "Something broke loading that video.";
  }
}

/** Map a raw YT.PlayerState to our deck vocabulary. */
function mapState(data: number, hasVideo: boolean): DeckState {
  switch (data) {
    case 0:
      return "ended"; // YT.PlayerState.ENDED
    case 1:
      return "playing";
    case 2:
      return "paused";
    case 3:
      return "buffering";
    case 5:
      return "cued";
    default:
      return hasVideo ? "cued" : "empty"; // -1 UNSTARTED
  }
}

export class Deck {
  private player: YT.Player | null = null;
  private ready = false;
  private targetVolume = 71; // equal-power centre by default
  private currentId: string | null = null;
  private lastRecordedId: string | null = null;
  private pendingCue: string | null = null;
  private state: DeckState = "empty";

  constructor(
    readonly side: DeckSide,
    private readonly mountId: string,
    private readonly cb: DeckCallbacks,
  ) {}

  /** Build the underlying YT.Player. Call once the API is ready. */
  init(YTApi: typeof YT, origin: string): void {
    const events = {
      onReady: () => {
        this.ready = true;
        this.player?.setVolume(this.targetVolume);
        log(`yt:ready:${this.side}`);
        if (this.pendingCue) {
          const id = this.pendingCue;
          this.pendingCue = null;
          this.cue(id);
        }
      },
      onStateChange: (e: YT.OnStateChangeEvent) => {
        const next = mapState(e.data, this.currentId !== null);
        log(`yt:state:${this.side}:raw=${e.data}->${next} (cur=${this.currentId})`);
        this.setState(next);
        // Re-assert volume when a video becomes cued/playing.
        if (next === "cued" || next === "playing") {
          this.player?.setVolume(this.targetVolume);
          this.maybeIdentify();
        }
      },
      onError: (e: YT.OnErrorEvent) => {
        log(`yt:error:${this.side}:${e.data}`);
        this.cb.onError(errorMessage(e.data));
        this.setState("errored");
      },
      // Newer API event; not in older typings, so attach loosely.
      onAutoplayBlocked: () => {
        log(`yt:autoplay-blocked:${this.side}`);
        this.setState("autoplay-blocked");
      },
    };

    this.player = new YTApi.Player(this.mountId, {
      width: "100%",
      height: "100%",
      playerVars: {
        origin,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
      },
      events: events as unknown as YT.Events,
    });
  }

  getState(): DeckState {
    return this.state;
  }

  /** Cue a video (loads, does not play). No-op-safe before the player is ready. */
  cue(id: string): void {
    this.currentId = id;
    if (!this.player || !this.ready) {
      this.pendingCue = id;
      this.setState("buffering");
      return;
    }
    log(`yt:cue:${this.side}:${id}`);
    this.player.cueVideoById(id);
    this.setState("cued");
  }

  play(): void {
    if (this.ready && this.currentId) this.player?.playVideo();
  }

  pause(): void {
    if (this.ready) this.player?.pauseVideo();
  }

  /** Master-play helper: replay from the top if ended, otherwise just play. */
  playOrReplay(): void {
    if (!this.ready || !this.currentId) return;
    if (this.state === "ended") this.player?.seekTo(0, true);
    this.player?.playVideo();
  }

  setVolume(volume: number): void {
    this.targetVolume = volume;
    if (this.ready) this.player?.setVolume(volume);
  }

  private setState(next: DeckState): void {
    if (next === this.state) return;
    this.state = next;
    this.cb.onState(next);
  }

  private maybeIdentify(): void {
    if (!this.currentId || this.currentId === this.lastRecordedId) return;
    this.lastRecordedId = this.currentId;
    let title = "";
    try {
      title = this.player?.getVideoData().title ?? "";
    } catch {
      title = "";
    }
    this.cb.onIdentified(this.currentId, title);
  }
}
