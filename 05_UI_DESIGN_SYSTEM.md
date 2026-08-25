# UI Design System

## Authority
`design-system/MASTER.md` is the design-system source of truth; implementation tokens live in `lib/design/tokens.ts` and `app/globals.css`. fileciteturn26file0L2-L6

## Visual language
Dark base, bold whitespace, neon `#C8E800` accent, role colors only as secondary identifiers. Do not hard-code colors in components.

## Tokens
- Surfaces: `#09090f`, `#111118`, `#1a1a24`
- Text: `#f0f0f5` with approved secondary/tertiary tokens
- Accent: `#C8E800`
- Cheer: gold
- Success: green
- Danger: red
- 4px spacing grid
- Radius: 8 / 12 / 16 / 28 / pill

## Typography
Bebas for display, Noto for body/headings, Space Mono for labels. Numeric counters use tabular numerals.

## Interaction
Use existing `INTERACTION`, `SPRING_*`, `MOTION`, `Pressable`, and motion helpers. Press scale 0.97; hover lift -2px and scale 1.02; standard glass blur 24px; minimum tap area 44px. fileciteturn9file0L2-L7

## Accessibility
AA text contrast, 44px touch targets, visible focus, semantic controls, `aria-expanded`/`aria-controls`, labels for icon buttons, reduced-motion fallback.

## Component rule
Reuse existing shared UI before adding a new primitive. New components must identify their domain responsibility and token usage.
