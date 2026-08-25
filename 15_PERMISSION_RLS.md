# Permission & RLS

## Principals
- Public/anon: only explicitly public data.
- Authenticated: public data plus narrowly scoped own/involved data according to table policy.
- Owner: only the owning user may manage their private resources.
- Admin: explicit server-side authorization for administrative mutations.
- Business: Business capabilities do not bypass ownership/RLS.
- Service role: server-only privileged operations.

## Permanent rules
Protected tables such as `users`, `journeys`, `career_profiles`, and `ads` follow the repository's permanent SELECT-only client access rule; writes go through service-role server routes. fileciteturn27file0L1-L2

## Ownership
The correct identity link is `auth.uid() = users.auth_id` or the established server-side email/slug relationship. Never compare `auth.uid()` directly to `slug`. fileciteturn27file0L1-L2

## Current Journey rules
Public journeys are readable; own/followed journeys have additional authenticated read paths. Client write grants are restricted according to the current security model. fileciteturn17file0L2-L2

## Current schedules
Public schedules or the owner's schedule are readable; mutation is owner-scoped. fileciteturn14file0L2-L6

## New features
Moment, Connection, and future Activity schema must define SELECT/INSERT/UPDATE/DELETE policies before implementation. Never use `USING(true)`/`WITH CHECK(true)` for public/authenticated write access.
