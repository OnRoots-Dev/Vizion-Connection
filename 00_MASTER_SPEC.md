# Vizion Connection — Master Specification

## Status
- Current: Next.js 16 / React 19 / TypeScript / Tailwind v4 / Supabase; five roles including Admin; Journey-based activity records; Cheer; schedules; Business plans and Square flow already exist.
- MVP: Activity/Moment/Viz Map-centered product loop, profile/Vizion ID, social interactions, schedule, Open Lab, Business foundation.
- Planned: terminology unification from Journey to Activity, Moment, Viz Map expansion, Connection as a distinct relationship.
- Future: route/course tracking and deeper collaboration.
- Deprecated: Airtable as a production data source; old root migrations.

## Product Identity
Vizion Connection is a sports platform that makes people, activity, places, support, and relationships visible as a connected sports ecosystem.

## Core Philosophy
**Sports activity becomes visible.** The product should turn otherwise fragmented sports effort into discoverable, contextual signals: who is active, what they are doing, where it happens, and who supports them.

## Core Loop
Viz Map → Activity → Moment → Cheer / Comment / Connection → Discovery → Activity.

## Core Objects
Vizion ID, Profile, Portfolio, Activity, Moment, Viz Map, Place, Schedule, Cheer, Comment, Connection, Skill, Community, Business, Open Lab.

## Roles
Athlete, Trainer, Crew, Business. Admin is an operational role, not a primary consumer role.

## Product principles
1. Show value immediately; do not make users complete a portfolio before the product becomes useful.
2. Activity is the recurring action and discovery primitive; it is not a generic social post.
3. Portfolio is depth after discovery, not the primary acquisition loop.
4. Map provides spatial context: nearby activity, moments, people, and sports.
5. Cheer means support, not merely a copied Like.
6. Connection means a meaningful relationship and is not a synonym for Follow.
7. Business participates in the ecosystem rather than being only an ad buyer.
8. Reuse existing implementation before creating new abstractions.
9. Security and production DB reality outrank speculative architecture.
10. Keep MVP small enough that every major feature communicates a clear value.

## Non-goals for MVP
No full Strava-grade tracking, route engine, marketplace/contract brokerage, large generic SNS feature set, or wholesale rewrite of existing auth/payment infrastructure.

## Current implementation anchors
The repository already has a single Next app, feature modules, Supabase integrations, schedules, Journey APIs/types, Cheer APIs/UI, Business checkout/webhook code, ad inventory, and a mature design system. fileciteturn29file0L2-L7

## Canonical implementation mapping
- Activity → current `journeys` / `JourneyEntry` behavior until a deliberate migration is approved.
- Profile/Vizion ID → current `users`/profile and public profile routes.
- Schedule → current `schedules` table and schedule UI.
- Cheer → current cheer APIs/components/RPC support.
- Business inventory → current `ad_slots` and Business plan constants.
- Payment → current Square Payment Link/webhook flow.
- Viz Map → Planned unless code audit proves a production Mapbox implementation.
- Moment → Planned unless code audit proves a dedicated implementation.
- Connection → Planned as a distinct relationship concept.

## Authority rule
This file is the highest product-level authority. Lower-level specs may add detail but may not silently contradict it. If code differs, document the difference as Current vs Planned and do not claim parity.
