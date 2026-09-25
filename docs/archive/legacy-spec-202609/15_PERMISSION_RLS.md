# Permissions & RLS

Public users may read only explicitly public, non-deleted, approved/published records. Authenticated users receive no implicit write entitlement. Owners may manage their own allowed records; admins use server-side explicit authorization; Business is a product role, not elevated database authority.

Every new table requires RLS enabled, least-privilege policies, and tests for anonymous, authenticated non-owner, owner, Business, and Admin cases. Prefer server routes for sensitive writes with service role confined to `lib/supabase/server.ts`. A visibility check is required at every related object boundary (Activity → Moment → comments/map). Deny by default.
