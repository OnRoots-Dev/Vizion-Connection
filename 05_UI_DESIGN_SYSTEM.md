# UI Design System Integration

Status: **Current — mandatory implementation rules.**

Vizion Connection is a sports culture / community product, not a generic SaaS dashboard.
The design system exists to make the product feel human, spatial, active, editorial, and premium.

## Authority

For UI implementation read in this order:

1. `00_MASTER_SPEC.md`
2. `05_UI_DESIGN_SYSTEM.md`
3. `06_UI_REFERENCE.md`
4. `.skills/taste-ui/SKILL.md`
5. `design-system/MASTER.md`
6. `lib/design/tokens.ts` / `app/globals.css`

Generic external UI guidance is supplementary and must not override the local rules above.

## Core visual language

- Sports culture
- Human activity
- Place and movement
- Editorial composition
- Strong typography
- Premium restraint
- Spatial depth
- Interaction that reveals meaning

Dark mode is part of the current brand, but "dark + border + neon" is NOT the design language by itself.

## Composition rules

### 1. Composition before components

Do not start from a component inventory.

First decide:
- what the section communicates
- what the visual focal point is
- what should be read first/second/third
- how the user moves through the section
- what changes on hover/tap/scroll

Only then select existing primitives.

### 2. Cards are a tool, not the default layout

Cards are appropriate for:
- contained entities
- selectable objects
- independent pieces of information
- maps / activity previews where containment improves comprehension

Cards are NOT the default container for:
- four roles
- four product benefits
- marketing feature lists
- brand statements
- editorial storytelling

Do not create a repeated card grid merely because there are multiple items.

### 3. Avoid repeated anatomy

The following repeated structure is forbidden as a default marketing pattern:

`icon → label → headline → mini UI/KPI → description → CTA`

If four items contain the same anatomy, redesign the composition.

### 4. Prefer editorial structures

Use when appropriate:
- numbered vertical lists
- asymmetric columns
- large role/type names
- oversized typography
- horizontal rules
- full-bleed media
- image + text split
- hover-reveal panels
- staggered layouts
- spatial/map compositions
- one dominant visual with secondary navigation

### 5. Real content over decorative UI

Do not fabricate statistics, percentages, views, sessions, regions, or product activity.
If real data is unavailable, use:
- descriptive labels
- real product concepts
- imagery
- interaction
- typography

## Role section rule

The four roles are:
- Athlete — 積み重ねを、存在感に。
- Trainer — 育てた選手が、実績になる。
- Crew — 推しの歩みを、そばで後押し。
- Business — ノイズではなく、シグナルへ支援を。

The role section should feel like choosing an identity / entering a world, not selecting a SaaS feature.

Recommended patterns:
- editorial vertical navigation
- asymmetric role index
- interactive list with visual reveal
- full-width role bands
- media-led role transitions

Avoid:
- equal 2x2 cards
- KPI blocks
- fake dashboard previews
- identical CTA placement in every item

## Typography

Use typography to create hierarchy, not as decorative micro-label overload.
English labels may support navigation, but do not turn every piece of information into ALL-CAPS UI chrome.

## Motion

Motion must communicate:
- focus
- selection
- spatial continuity
- activity
- response

Do not animate every card simply because Framer Motion is available.

## Accessibility

Maintain:
- 44px minimum interactive target
- AA contrast
- visible focus
- keyboard navigation
- reduced-motion fallback
- semantic links/buttons

## Final UI test

Before delivery ask:

1. Could this be mistaken for a generic AI-generated SaaS page?
2. Is the layout still understandable if all borders are removed?
3. Does the composition communicate sports / people / activity / place?
4. Is every number real and necessary?
5. Did we choose the layout because of the content, or because a grid component was convenient?

If 1 is yes, redesign.
