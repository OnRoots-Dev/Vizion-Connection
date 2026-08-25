# Vizion Connection — Agent Operating Rules

## Source hierarchy
1. `00_MASTER_SPEC.md` — product/spec authority.
2. The numbered SPEC files — domain detail.
3. `design-system/MASTER.md` and `lib/design/tokens.ts` — UI authority.
4. Existing production code and `supabase/migrations/` — implementation truth.
5. `.skills/*/SKILL.md` — execution guidance; never silently override SPECs.

## Existing First
Before implementing, search the repository for the same responsibility, route, component, type, API, DB table, RPC, and validation rule.

## Reuse First / No Duplicate
Reuse existing components, APIs, feature modules, Supabase helpers, tokens, and motion recipes. Do not create a second implementation of an existing responsibility.

## Spec First
Read the relevant numbered SPEC and Skill before changing code. Record uncertain behavior as `Undecided`; do not invent requirements.

## Status discipline
Every requirement must be marked `Current`, `MVP`, `Planned`, `Future`, or `Deprecated`. Never describe Planned/Future work as implemented.

## Production DB First
`public` production schema is the DB truth. Treat migration history as evidence, not as proof that the live schema is identical. Do not add or change migrations during this specification task.

## Security
Preserve RLS, service-role boundaries, CSRF validation, rate limiting, Zod/body validation, HMAC verification, idempotency, and PII-safe logging. Never expose service-role credentials.

## Minimal Change
Do not delete, migrate, rename, or rewrite existing product code merely to fit the new specification. This task is documentation/agent-foundation work.

## Verification
After implementation changes, run `npm run lint`, `npx tsc --noEmit`, `npm run build`, relevant tests, and inspect `git diff`. For this documentation task, verify file names, links, terminology, and status labels.

## Architecture guardrails
- Next.js 16 App Router / React 19 / TypeScript / Tailwind v4 / Supabase.
- `app/` owns routes and Route Handlers; `features/` owns domain logic; `lib/` owns cross-cutting infrastructure; `components/` owns reusable UI.
- Supabase writes to protected production tables go through server-side/service-role paths according to `SECURITY.md`.
- `user.id` and `user.slug` are different identifiers; do not substitute one for the other.
- Existing dashboard is a URL-stable SPA; do not introduce navigation changes without checking frontend rules.

## Current vs planned product vocabulary
Current implementation uses `Journey` for activity-like records. Product direction standardizes the concept as `Activity`; migration/unification is Planned unless existing code already provides the behavior.
`Cheer` exists today. `Connection`, `Moment`, and `Viz Map` are product concepts in the new specification and are not to be assumed implemented unless a code audit confirms them.

## Do not do in specification phase
No DB migration, schema change, bulk API addition, auth redesign, Square redesign, Mapbox implementation, destructive cleanup, or large application rewrite.
