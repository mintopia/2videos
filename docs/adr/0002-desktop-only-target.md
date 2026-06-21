# 2. Target desktop browsers only

Date: 2026-06-20

## Status

Accepted

## Context

The crossfader works by calling the YouTube IFrame API's `setVolume(0–100)` on
each deck's player. On iOS Safari (and iOS browsers generally), programmatic
media volume is a no-op — volume is hardware-only. The crossfader therefore
cannot function on iOS at all, which is the core feature of the app.

Other embed realities were considered and accepted: pre-roll/mid-roll ads cannot
be suppressed (the user is expected to have YouTube Premium or an ad blocker),
and autoplay-with-sound is gated behind a user gesture (acceptable — the user
clicks play).

## Decision

Target desktop browsers (Chrome, Firefox, Edge, Safari on macOS), where
`setVolume` is honoured. Do not support iOS. Android Chrome honours `setVolume`
but is not a design target; it may work but is untested.

## Consequences

- The app assumes a pointer + keyboard, larger viewport, and working
  programmatic volume. No mobile-first responsive work in v1.
- We surface a brief note that the app needs a desktop browser.
- Ads are not fought; embedding-disabled videos are handled explicitly with a
  per-deck error state.
