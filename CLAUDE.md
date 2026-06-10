# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server on localhost:3000
npm run build     # Production build
npm run lint      # Run ESLint
```

There is no test suite. TypeScript type-checking is done via the build or via the IDE's language server (`tsc --noEmit`).

## Architecture Overview

**Vizion Connection** is a Japanese sports platform (vizion-connection.jp) connecting athletes, trainers, crew, and businesses. It is a Next.js 16 App Router application using React 19, TypeScript, Tailwind v4, and Supabase as the database.

### Route Groups

- `app/(app)/` — Authenticated app shell (dashboard, pulse, timeline)
- `app/(auth)/` — Auth pages: login, register, reset-password, verify
- `app/(marketing)/` — Public marketing pages
- `app/(onboarding)/` — Multi-step onboarding (day0 → profile → discovery → journey → invite → cheer)
- `app/api/` — REST-style API routes (one directory per feature)
- `app/p/[slug]` — Public profile card pages
- `app/u/[slug]` — User profile pages
- `app/r/[slug]` — Referral pages

### Dashboard SPA Pattern

The main authenticated experience at `/dashboard` is a **single-page SPA** — navigation between sections does not change the URL. The `DashboardView` union type (`app/(app)/dashboard/types.ts`) enumerates all views. `DashboardClient` renders the active view via a switch and `Sidebar` calls `setView()` to navigate. Pulse (`/pulse`) and Timeline (`/timeline`) are separate full-page routes outside the dashboard SPA.

### Feature Modules (`features/`)

Feature-scoped logic lives here rather than in `lib/`. Each feature has:
- `server/` — Server Actions or server-only helpers
- `types.ts` — Feature-specific types
- `validation/` — Zod schemas (where applicable)

### Supabase Client Split

Three distinct clients — use the right one for the context:

| File | When to use |
|------|-------------|
| `lib/supabase/server.ts` → `supabaseServer` | Server Actions / API routes needing service role (bypasses RLS) |
| `lib/supabase/server.ts` → `createClient()` | Server Components needing user auth context (cookie-based, respects RLS) |
| `lib/supabase/browser.ts` → `supabaseBrowser` | Client Components (anon key, persists session) |
| `lib/supabase/client.ts` → `createClient()` | SSR client for middleware |

Data access helpers are grouped by domain in `lib/supabase/` (e.g. `career-profiles.ts`, `follows.ts`, `notifications.ts`).

### User Roles and Theming

Five roles: `Athlete | Trainer | Crew | Business | Admin` (defined in `features/auth/types.ts`).

Role colors used throughout the UI:
- Athlete: `#FF5050`
- Trainer: `#32D278`
- Crew: `#FFC81E`
- Business: `#3C8CFF`

The dashboard supports three themes (`dark | dim | light`). Dynamic colors (borders, backgrounds, text) are driven by a `ThemeColors` object passed as prop `t` — avoid hardcoding colors in dashboard components; use `t.bg`, `t.border`, `t.text`, `t.sub`, etc.

Sponsor plans: `roots | roots_plus | signal | presence | legacy` (on the `ProfileData.sponsorPlan` field).

### Security Conventions

- **CSRF**: All mutating API routes call `validateCSRF(req)` from `lib/security/csrf.ts` — it checks `Origin`/`Referer` against the allowlist.
- **Rate limiting**: All sensitive endpoints use per-action limiters from `lib/ratelimit.ts` (backed by Upstash Redis).
- **Body validation**: Incoming request bodies should be parsed through `lib/security/body.ts`.
- **Service role key** must never reach the browser — `lib/supabase/server.ts` throws at module load if `window` is defined.

### Styling

- Tailwind v4 (`@import "tailwindcss"` in `globals.css`)
- shadcn/ui for base components (`components/ui/`)
- Framer Motion for all animations
- Design tokens use `--vc-*` CSS custom properties for the dark design system
- Fonts: `--font-bebas` (Bebas Neue, display/headings) and `--font-noto` (Noto Sans JP, body — Japanese-first)
- Path alias: `@/` maps to the repo root

### Environment Variables

Required at runtime (see `lib/env.ts`):

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
RESEND_API_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
NEXT_PUBLIC_BASE_URL
```

Optional: `FROM_EMAIL`, `VOICELAB_ADMIN_EMAILS`, `SQUARE_LINK_*`, `SQUARE_WEBHOOK_SIGNATURE_KEY`.

### Known Context

The codebase was recently migrated from Airtable to Supabase. The `airtable` package in `package.json` is a leftover with no active imports and can be removed. See `MIGRATION_ANALYSIS_REPORT.md` for known bugs identified during the migration (e.g. routes using `user.id` where `user.slug` is required).
