# Taste UI Skill — Vizion Native

## Purpose

Create UI that feels like **Vizion Connection**, not generic AI-generated SaaS.

Read before implementation:
1. `05_UI_DESIGN_SYSTEM.md`
2. `06_UI_REFERENCE.md`
3. `design-system/MASTER.md`
4. `lib/design/tokens.ts`

## Hard rules

### Never default to

- 2x2 / 3-column equal card grids
- repeated identical marketing cards
- icon + title + description + KPI + CTA anatomy
- fake statistics or placeholder metrics
- dashboard widgets used as decoration
- black + thin border + neon as the whole visual language
- rounded containers around every section
- excessive micro labels
- generic SaaS landing-page patterns

### Prefer

- editorial typography
- asymmetric composition
- numbered lists
- full-width sections
- activity / place / people context
- photography or meaningful media
- interactive reveal
- strong whitespace
- role-based color accents
- spatial transitions
- one dominant visual rather than four equal boxes

## Role sections

Athlete / Trainer / Crew / Business represent identities.

Treat them as **four entrances into Vizion**, not four product features.

The default role presentation should therefore be an editorial or interactive composition, not four cards.

Do not invent metrics such as:
- posts
- cheers
- sessions
- results
- views
- regions
- percentages

unless those values are real data.

## Decision process

Before JSX:
1. Write the section's single message.
2. Choose the focal point.
3. Choose the composition.
4. Define interaction/reveal.
5. Then select components.

## Delivery gate

Reject and redesign if the output can be described as:
- AI-generated card grid
- generic SaaS landing page
- dashboard template
- feature-card template

## Accessibility

Keep 44px targets, AA contrast, visible focus, keyboard support, and reduced-motion fallback.
