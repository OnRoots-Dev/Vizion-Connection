# Development Roadmap

## Phase 0 — Existing code audit
Inventory routes, components, features, APIs, DB tables, migrations, RLS, payment flow, and current UI tokens.

## Phase 1 — UI / Frontend
Build/align Activity, Moment, Viz Map, Vizion ID, and interaction surfaces using existing design primitives.

## Phase 2 — Backend
Define only the new server/domain logic required by approved UI and schemas.

## Phase 3 — Frontend × Backend
Connect forms, discovery, map interactions, social actions, and Business flows.

## Phase 4 — DB integration
Only after production schema is confirmed and migration design is approved.

## Phase 5 — Security hardening
RLS, auth, CSRF, rate limits, validation, admin authorization, webhook integrity.

## Phase 6 — Testing
Unit/integration/security/RLS plus responsive and accessibility smoke tests.

## Phase 7 — Polish
Motion, micro-interactions, performance, empty states, copy, and visual consistency.

## Ordering principle
Existing code audit precedes implementation. Critical security issues must be resolved before public release even if they are outside the immediate feature sequence.
