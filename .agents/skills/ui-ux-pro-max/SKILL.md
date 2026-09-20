---
name: ui-ux-pro-max
description: "Supplementary UI/UX research and validation for Vizion Connection. Local Vizion design rules always have priority."
---

# UI/UX Pro Max — Vizion Connection Adapter

This repository is a **Next.js web application**, not a React Native-only project.

This Skill is supplementary. It must never override:
- `00_MASTER_SPEC.md`
- `05_UI_DESIGN_SYSTEM.md`
- `06_UI_REFERENCE.md`
- `.skills/taste-ui/SKILL.md`
- `design-system/MASTER.md`

## Required behavior

When this skill is invoked for Vizion Connection:

1. Read the local Vizion design documents first.
2. Use the existing design system and components as the implementation authority.
3. Use the UI/UX Pro Max database only for:
   - accessibility checks
   - interaction research
   - responsive behavior
   - motion guidance
   - comparative reference research
4. Never let a generated "design system" replace `design-system/MASTER.md`.
5. Never generate a generic SaaS/dashboard visual language just because the requested page contains multiple items.
6. Never interpret "modern", "premium", "minimal", or "dark" as permission to create a card grid.
7. For marketing UI, run an explicit anti-template review before delivery.

## Vizion-specific rejection rules

Reject any proposed composition that defaults to:
- 2x2 equal cards
- repeated feature cards
- icon + title + description + KPI + CTA
- fake metrics
- dashboard widgets used as decoration
- black surface + thin border + neon accent repeated everywhere
- excessive rounded rectangles

## Composition rule

For multiple roles/categories, decide the composition from meaning first.

Preferred:
- editorial list
- asymmetric layout
- oversized typography
- media-led layout
- interactive reveal
- spatial/map composition
- full-width bands

Cards remain available when they are semantically appropriate, but are never the automatic solution.

## Tooling note

The existing `.agents/skills/ui-ux-pro-max/scripts/` may still be used for supplementary searches.
If a generated result conflicts with the local Vizion rules, discard the conflicting portion.

## Final validation

Before delivering UI:
- check accessibility
- check responsive behavior
- check reduced motion
- check real data integrity
- check that the result does not resemble a generic AI/SaaS template
