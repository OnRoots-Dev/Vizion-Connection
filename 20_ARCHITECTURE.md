# Architecture

## Current layer model
middleware → `app/` → `features/` / `lib/` / `components/` → Supabase. `features/` owns domain logic; `lib/` owns cross-cutting infrastructure; `components/` owns reusable UI. fileciteturn29file0L2-L7

## Responsibilities
- `app/`: routes, pages, Route Handlers, route-level composition.
- `features/`: server logic, types, validation, domain rules.
- `lib/`: auth, Supabase clients, security, ads, design, rate limiting and shared infrastructure.
- `components/`: reusable UI.
- `supabase/migrations/`: schema changes only.

## Desired request path
UI → Route/API → feature server function → shared service/helper → Supabase.

## Security boundary
Browser code never receives service-role credentials. Protected writes cross a server boundary.

## Future
Map rendering can introduce a client map layer while keeping domain fetching/authorization server-side. A monorepo is not currently planned for the short term.

## Architectural rule
Do not restructure directories just to make them match this document. Record deviations and improve incrementally.
