# 1. Vanilla TypeScript + Vite, no UI framework

Date: 2026-06-20

## Status

Accepted

## Context

The app is a single-page audio crossfader for two YouTube videos (see CONTEXT.md
for the domain language: decks, crossfader, mix). Its actual surface area is
small: instantiate two YouTube IFrame players, wire one slider to two
`setVolume` calls, parse/write a query string for the mix link, and read/write
local storage for deck history.

The two YouTube players are controlled imperatively through the IFrame Player
API. A reactive UI framework would spend most of its value reconciling a virtual
DOM against objects it cannot own.

## Decision

Build with vanilla TypeScript bundled by Vite. No React/Vue/Svelte. TypeScript
gives type safety around the IFrame API and URL/state encoding; Vite gives a dev
server and a static production build. Output is plain static files.

## Consequences

- No framework runtime; smaller bundle, fewer dependencies, nothing to babysit
  the iframes.
- We hand-roll the small amount of DOM updating we need (slider, history list,
  inputs). Acceptable at this size; would get awkward if the app grew large.
- Hosting is trivial — static files on any static host.
- If the app later grows well beyond the "two videos and a slider" scope, this
  decision may need revisiting (superseding ADR).
