# Tech Stack

## Current
- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase / `@supabase/ssr` / `@supabase/supabase-js`
- Zod
- Framer Motion / Motion / GSAP
- Zustand
- FullCalendar
- Upstash Redis / rate limiting
- Resend
- Square Payment Links + webhook integration

The current `package.json` confirms these major dependencies and versions. fileciteturn2file0L1-L6

## Planned
- Mapbox GL JS for Viz Map.
- Dedicated Moment/Connection data models when approved.

## Avoid unnecessary additions
Prefer existing libraries and internal primitives. Do not add a dependency for a capability already covered by the stack.

## Infrastructure direction
Keep the current single-repository architecture until scale or ownership boundaries justify change. Monorepo is explicitly not current. fileciteturn29file0L2-L7
