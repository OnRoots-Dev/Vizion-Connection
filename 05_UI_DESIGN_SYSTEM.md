# UI Design System Integration

Status: **Current rules apply.** Source of truth is `design-system/MASTER.md`, `lib/design/tokens.ts`, and `app/globals.css`; do not create a competing token system.

- Reuse existing UI primitives, `Pressable`, icon dictionary, motion tokens, and role colors.
- Dark, premium, minimal, dynamic, social, spatial, sports; neon accent is reserved for focus/reward.
- Use 4px spacing, prescribed radii, 44px targets, AA text contrast, semantic labels, and reduced-motion fallbacks.
- New Map, Activity, and Moment cards use the existing card surface and interaction recipes. No raw hex or arbitrary animation constants.

Current UI contains dashboard, profile, schedule, timeline, news, and business surfaces. Planned flows must integrate into these shells before inventing parallel navigation.
