# Database Schema

## Production truth
The production Supabase schema is authoritative. Migration files are historical implementation evidence and may not perfectly represent the current live database.

## Confirmed/current objects
- `users` — identity/profile foundation.
- `journeys` — current activity-like records.
- `schedules` — structured schedule records.
- `user_follows` — current Follow relationship.
- `ad_slots` — Business inventory.
- `business_sponsorships` — Business sponsorship relation.
- `business_orders` — Business order foundation referenced by current code.
- `career_profiles`, `ads` and other existing domain tables are present in the security/architecture documentation.

## Schedule schema
Current migration defines `schedules(id, user_slug, title, start_at, end_at, location, description, category, is_public, created_at, updated_at)`. fileciteturn14file0L2-L6

## Activity mapping
No production `activities` table was confirmed; the RLS alignment explicitly maps the conceptual Activity object to `journeys`. fileciteturn17file0L1-L2

## Classification
- Existing: verified/current tables and fields above.
- Required: fields needed by the MVP that are not yet confirmed in production.
- Planned: new schema needed for Moment/Viz Map/Connection only after design approval.
- Deprecated: old migration paths and legacy Airtable assumptions.

## Rule
Do not add schema merely to make the spec look complete. First inspect production schema, existing migrations, queries, types, and RLS.
