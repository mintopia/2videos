# Two videos and a motherfucking slider

A single-page, zero-backend crossfader for the audio of two YouTube videos. Load
a video into the **left deck** and the **right deck**, hit play, and ride the
equal-power **crossfader** between them. Share a mix with a link; each deck
remembers what you loaded before. Desktop only (iOS Safari won't let a webpage
touch the volume).

## Run it

```bash
npm install
npm run dev        # dev server
npm test           # unit tests (parser, crossfader math, mix link, history)
npm run build      # type-check + static production bundle in dist/
npm run preview    # serve the built bundle
```

The build is plain static files. Drop `dist/` on any static host. No server, no
API keys.

## Deploy (Cloudflare)

The app is served as a static-assets Worker. `wrangler.jsonc` points Cloudflare
at the `dist/` build output, so no server code runs.

When you connect this repo in Cloudflare ("Import a repository" / Workers
Builds), set:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Production branch | `main` |

Node version is pinned via `.nvmrc` (20). No environment variables or secrets
are required. Pushing to `main` triggers a production deploy; pull requests get
preview deployments automatically.

Deploy from your machine instead:

```bash
npx wrangler login
npm run deploy        # runs: wrangler deploy (builds dist first via `npm run build`)
```

> Using the classic **Pages** UI instead of Workers Builds? There's no deploy
> command there: set build command `npm run build` and output directory `dist`.
> Or push a one-off from the CLI with `npx wrangler pages deploy dist`.

## How it works

- `src/parse.ts` — turns a pasted URL / ID into a validated 11-char video ID.
- `src/crossfader.ts` — the equal-power law: `left = cos(x·π/2)`, `right = sin(x·π/2)`.
- `src/mixlink.ts` — encodes/decodes the shareable mix state (`?l=&r=&x=`).
- `src/history.ts` — per-deck recents in `localStorage`, degrades to in-memory.
- `src/youtube.ts` — the IFrame API loader and the per-deck state machine.
- `src/main.ts` — wires the DOM to all of the above.

Add `?debug=1` to the URL for dev-only structured console logging.

## Docs

- `PRODUCT.md` / `DESIGN.md` — product and visual system (the design language).
- `PLAN.md` / `DESIGN-BRIEF.md` — the locked implementation plan and design brief.
- `CONTEXT.md` — glossary. `docs/adr/` — architecture decisions.
