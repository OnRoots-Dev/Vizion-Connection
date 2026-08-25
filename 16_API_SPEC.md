# API Specification

## Current API groups
Auth: login/logout/register/confirmation/account. Profile: profile/career-profile/bond/cheer/collect. Activity-like: journey/daily-log/daily-circuit/pulse/missions. Business: business-checkout/business-hub/webhooks/sponsorships. Other: ads/discovery/schedules/news/notifications/OG/share. fileciteturn29file0L2-L7

## API rules
- Route handlers validate input with Zod or equivalent schema.
- Mutations require authentication and ownership/role checks.
- CSRF protection and rate limiting apply to mutating routes where applicable.
- Service-role Supabase access remains server-side.
- Return stable, non-sensitive error codes; do not leak DB errors or PII.

## Planned endpoints
Exact endpoint names for Moment, Viz Map, and Connection are **Planned/Undecided** until domain schema and UX are finalized.

## API design
Prefer existing feature server modules (`features/<name>/server`) and shared helpers. Avoid putting business logic directly into page components or route handlers.

## Compatibility
Do not create duplicate endpoints for the same responsibility. Extend existing routes when semantics match; create a new route only when the domain responsibility is genuinely new.
