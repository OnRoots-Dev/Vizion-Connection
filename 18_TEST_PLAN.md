# Test Plan

## Authentication
Register, verify, login, logout, reset, deleted account, session expiry.

## Role
Athlete/Trainer/Crew/Business/Admin capability boundaries and unauthorized access.

## Profile / Vizion ID
Public/private visibility, ownership, slug routing, share surfaces, media validation.

## Activity
Create/read/update/delete, visibility, date/time, place, media, tags, repeated use, empty/error states.

## Moment
Creation from Activity, visibility, media, deletion, permission, rendering.

## Map
Marker rendering, clustering, filters, marker-to-card flow, mobile gestures, no-location handling.

## Social
Cheer idempotency, count correctness, Comment validation/moderation, Connection state transitions, rate limits.

## Schedule
Public/private reads, owner mutation, timezone/date boundaries.

## Business
Plan selection, inventory boundaries, order creation, checkout, webhook signature, duplicate webhook, failed inventory increment.

## RLS
Anon, authenticated, owner, non-owner, Admin, service-role cases for every protected table.

## Security
CSRF, rate limits, mass assignment, PII logging, secret exposure, forged ad/payment events, authorization bypass.

## Quality gates
`npm run lint`, `npx tsc --noEmit`, `npm run build`, targeted tests, manual responsive/accessibility smoke tests, and `git diff` review.
