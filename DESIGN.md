---
name: Two videos and a motherfucking slider
description: A two-color bootleg crossfader for two YouTube videos, in the dark.
colors:
  left-cyan: "oklch(0.70 0.16 230)"
  right-red: "oklch(0.69 0.21 30)"
  ink: "oklch(0.16 0.012 60)"
  ink-2: "oklch(0.21 0.014 60)"
  ink-3: "oklch(0.27 0.016 60)"
  paper: "oklch(0.93 0.015 80)"
  paper-dim: "oklch(0.72 0.012 80)"
typography:
  display:
    fontFamily: "Anton, Archivo, system-ui, sans-serif"
    fontSize: "clamp(40px, 7vw, 96px)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(20px, 3vw, 34px)"
    fontWeight: 900
    lineHeight: 1.0
    letterSpacing: "0.01em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Space Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.12em"
rounded:
  none: "0px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "28px"
  xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
  input-url:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "10px 12px"
---

# Design System: Two videos and a motherfucking slider

## 1. Overview

**Creative North Star: "The Two-Color Bootleg"**

This is a punk show flyer that happens to mix audio. Picture a riso-printed gig poster, run off on a borrowed photocopier in two ink colors, dark room, one in the morning, both videos glowing on a laptop while someone drags a fat slider back and forth for the hell of it. The whole system is built from that scene: a warm near-black canvas, a film of grain over everything, blunt poster typography, and exactly two screaming ink colors, cyan on the left and red on the right, that bleed into each other at the crossfader.

The two colors are not decoration, they are information. The left deck is cyan, the right deck is red, and you can read which side is winning the mix from across the room. Everything else, every surface, every label, every chrome detail, is a neutral tinted near-black or off-white so the two inks never have to fight background noise to be heard. Depth comes from 2px borders and three flat tonal steps of ink, never from shadow or blur. Corners are hard. Nothing is rounded, nothing is soft, nothing apologizes.

This system explicitly rejects the things `PRODUCT.md` names as enemies: the **generic SaaS dashboard** (no card grids, no sidebar shell, no hero-metric tiles), the **corporate-safe** look (nothing beige, focus-grouped, or sanded down), and the **cluttered pro-DAW** (no wall of tiny meters and controls). It also stays off the obvious "web audio demo" reflex: these are flat print inks, not glowing neon knobs on a glossy black dial.

**Key Characteristics:**
- Two named inks (cyan left, red red) carry deck identity, the fader track, and the gain readouts.
- Warm near-black canvas, never pure black; off-white text, never pure white.
- Riso grain over the whole surface; flat, hard-cornered, 2px-bordered chrome.
- Blunt poster display type (Anton) over monospace utility labels (Space Mono).
- The crossfader is the heaviest object on screen, by design.

## 2. Colors: The Two-Ink Press

A two-color riso press on dark paper: two saturated inks, three tonal steps of near-black, one off-white. Nothing else.

### Primary
- **Left Cyan** (oklch(0.70 0.16 230)): The left deck's identity. Its frame, its tag dot, its half of the crossfader track, its gain readout. Anywhere "left" needs to be read at a glance.
- **Right Red** (oklch(0.69 0.21 30)): The right deck's identity, mirror of Left Cyan. Also the default accent for global controls (focus rings on the masthead/master row, the hot word in the wordmark) since red carries furthest on dark paper.

### Neutral
- **Ink** (oklch(0.16 0.012 60)): The canvas. A warm-tinted near-black. The base everything sits on.
- **Ink-2** (oklch(0.21 0.014 60)): Raised surfaces, the deck bodies and the crossfader console.
- **Ink-3** (oklch(0.27 0.016 60)): Hairlines, default borders, input wells, the unloaded-screen hatch.
- **Paper** (oklch(0.93 0.015 80)): Primary text and the slider thumb. The off-white ink.
- **Paper-Dim** (oklch(0.72 0.012 80)): Labels, captions, secondary and placeholder text.

### Named Rules
**The Two-Ink Rule.** There are exactly two chromatic colors: Left Cyan and Right Red. They are reserved for deck identity and the crossfader. Never introduce a third hue, never tint a neutral with anything but the canvas warmth (chroma ≤ 0.016). If a new element needs to "pop", it earns paper or one of the two inks, never a new color.

**The No-Pure-Black Rule.** `#000` and `#fff` are forbidden. The darkest surface is Ink, the lightest is Paper. Pure values look like a bug, not a choice.

## 3. Typography

**Display Font:** Anton (with Archivo, system-ui, sans-serif fallback)
**Body Font:** Archivo (with system-ui, sans-serif fallback)
**Label/Mono Font:** Space Mono (with ui-monospace, monospace fallback)

**Character:** A condensed poster shout over a deadpan technical mutter. Anton is the gig-flyer headline, set huge and uppercase. Space Mono is the equipment label, small and letter-spaced, the Teenage-Engineering utility voice. Archivo bridges them for the rare run of prose. The contrast between the shout and the mutter is the whole personality.

### Hierarchy
- **Display** (Anton 400, clamp(40px, 7vw, 96px), line-height 0.92, uppercase): The wordmark, and the big `L` / `R` end labels flanking the crossfader. Used once or twice, never repeated.
- **Headline** (Archivo 900, clamp(20px, 3vw, 34px), line-height 1.0): Section-weight emphasis where Anton would be too loud. Sparing.
- **Body** (Archivo 600, 16px, line-height 1.5): The honest notes and any sentence longer than a label. Cap measure at 65–75ch.
- **Label** (Space Mono 700, 12px, letter-spacing 0.12em, uppercase): Deck tags, the kicker, gain readouts, button text, input text, captions. The default voice of the chrome.

### Named Rules
**The Shout-Once Rule.** Anton appears at most twice on screen: the wordmark and the fader's L/R. Everything else is Space Mono or Archivo. A page full of poster type is a poster, not a tool.

## 4. Elevation

Flat. There are no shadows anywhere in this system. Depth is built from two devices only: 2px solid borders, and three flat tonal steps of the canvas (Ink → Ink-2 → Ink-3). A raised surface is raised because it is one step lighter and outlined, not because it floats. The riso grain sits over everything at low opacity as texture, not as elevation.

### Named Rules
**The Flat Print Rule.** No `box-shadow`, no `filter: blur`, no glassmorphism, ever. If something needs to read as lifted or active, change its border color or its tonal step, or fill it with an ink. If you reach for a drop shadow, you have left the system.

## 5. Components

### Buttons
- **Shape:** Hard corners (0px). Always.
- **Primary:** Paper fill, Ink text, Space Mono uppercase label, 10px 16px padding. The blunt solid button (Play, Cue).
- **Ghost:** Transparent fill, Paper text, 2px border in Ink-3 or Paper. Secondary actions (Copy mix link).
- **Hover / Focus:** No color invert on hover; a 1px downward `translateY` on `:active` for a tactile press. `:focus-visible` draws a 2px outline in the contextual ink (Right Red for global controls, the deck's own ink inside a deck).

### Inputs / Fields
- **Style:** Ink fill, 2px Ink-3 border, Paper text in Space Mono, 0px radius, 10px 12px padding. Placeholder in Paper-Dim.
- **Focus:** 2px outline in Right Red (or the deck's ink), 1px offset. No glow.
- **Error:** Border and a short blunt message in the deck's ink; the message is human, not a code dump.

### Cards / Containers (Decks & Console)
- **Corner Style:** Hard (0px).
- **Background:** Ink-2 on the Ink canvas.
- **Border:** 2px. Decks are framed in their own ink (Left Cyan / Right Red); the crossfader console is framed in Ink-3.
- **Shadow Strategy:** None. See Elevation.
- **Internal Padding:** 14px in deck chrome (tight), 28–32px around the crossfader (generous). The spacing asymmetry is deliberate.

### The Crossfader (signature component)
The heaviest object on screen. A full-width console below the two decks, framed in Ink-3, holding a fat horizontal `<input type="range">` flanked by huge Anton `L` and `R` end labels. The track is a left-to-right blend from Left Cyan to Right Red; the thumb is a tall Paper block (26×46) with a 3px Ink border. Live equal-power gain readouts (`L 71% · R 71%`) sit above, each in its deck's ink. Keyboard-operable as a native range. Respects `prefers-reduced-motion`.

## 6. Do's and Don'ts

### Do:
- **Do** keep exactly two inks: Left Cyan (oklch(0.70 0.16 230)) and Right Red (oklch(0.69 0.21 30)). Cyan is always left, red is always right.
- **Do** make the crossfader the single heaviest element on the page, with the most surrounding space.
- **Do** carry deck identity redundantly: ink color AND the L/R label AND fader position AND the text gain readout. Color is never the only signal.
- **Do** keep all corners hard (0px) and all depth flat (2px borders, tonal steps).
- **Do** write chrome in Space Mono uppercase; reserve Anton for the wordmark and the fader's L/R only.
- **Do** keep neutrals warm-tinted near-black/off-white (chroma ≤ 0.016), never pure `#000`/`#fff`.

### Don't:
- **Don't** build a **generic SaaS dashboard**: no card grids, no sidebar nav, no hero-metric tiles, no rounded-corner blandness.
- **Don't** drift **corporate / safe**: nothing beige, focus-grouped, or sanded down. If it looks like a Series B design system, it has failed.
- **Don't** approach **pro-DAW clutter**: no wall of meters, knobs, or tiny labels. The whole UI is graspable in one glance.
- **Don't** reach for the neon-synth-toy reflex: no glowing knobs, no glossy skeuomorphic dials, no RGB. These are flat print inks.
- **Don't** use `box-shadow`, `backdrop-filter`, glassmorphism, gradient text (`background-clip: text`), or side-stripe borders. All forbidden.
- **Don't** introduce a third color or round a corner. When something needs emphasis, it gets Paper or an existing ink.
