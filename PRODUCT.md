# Product

## Register

product

## Users

People who want to blend the audio of two YouTube videos in real time, with zero setup. The archetype: someone who wants to play a music video on one side and a different mix, backing track, or second video on the other, and ride the balance between them like a DJ. They arrive with two URLs in hand, on a desktop browser, and want to be mixing within seconds. They are not audio professionals and do not want a studio. They want "two YouTube videos and a motherfucking slider."

## Product Purpose

A single-page, zero-backend web app that loads two YouTube videos (a **left deck** and a **right deck**) and puts a **crossfader** between them. Both decks play at once; the slider rides the equal-power balance between their audio. A mix is shareable via a **mix link**, and each deck remembers what you loaded before. Success is: paste two URLs, hit play, and be blending audio in under ten seconds, with the slider feeling good enough that people drag it back and forth just because it's fun.

## Brand Personality

Irreverent, confident, punk-DIY. Three words: **blunt, playful, unpretentious**. The voice swears a little and never apologizes for it. Copy is direct and human, never corporate. The product has an opinion and commits to it. It treats the user like a peer who's in on the joke, not a customer to be onboarded. Limits (desktop-only, ads, embed errors) are stated plainly, with humor, never buried.

## Anti-references

- **Generic SaaS dashboard.** No sidebar nav, no hero-metric tiles, no endless identical card grids, no rounded-corner blandness. This is one screen with two videos and a slider, not an app shell.
- **Corporate / safe.** Nothing focus-grouped, beige, or sanded-down. If it looks like it shipped from a Series B startup's design system, it has failed.
- **Cluttered pro-DAW.** Not Ableton or Logic. No wall of tiny controls, meters, and labels. Density is the enemy. The whole interface is graspable in one glance.

## Design Principles

1. **Attitude over apology.** The name sets the tone and the UI commits to it. No corporate hedging, no softening the edges to seem professional. The personality is the point.
2. **Two videos and a slider, nothing else.** Ruthless focus. Every control beyond the two decks and the crossfader has to fight for its place. When in doubt, cut it.
3. **The crossfader is the hero.** It is the one interaction that defines the product. Make it big, central, tactile, and satisfying enough that people drag it for the joy of it.
4. **Honest about the seams.** Desktop-only, ads, embed-disabled videos, no sync. State these plainly and with humor rather than hiding them or pretending they don't exist.
5. **No friction, no gates.** Paste, play, mix. No accounts, no setup wizard, no onboarding wall, no cookie theatre. The fastest path from URL to sound wins.

## Accessibility & Inclusion

Light touch, not formal compliance. Cover the basics: the crossfader and transport must be keyboard-operable (native `<input type="range">` and real buttons), maintain legible text contrast, and respect `prefers-reduced-motion`. Don't over-invest in WCAG AA/AAA conformance at the expense of the vibe, but never ship something a keyboard user can't operate.
