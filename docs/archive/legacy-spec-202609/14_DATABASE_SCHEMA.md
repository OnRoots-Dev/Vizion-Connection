# Database Schema

Status: **Migration audit, not a live-schema assertion. Production Supabase is authoritative and must be inspected read-only before schema work.**

| Classification | Tables/models |
|---|---|
| Existing / evidenced | `users`, `journeys`, `user_follows`, `schedules`, `events`, `event_invites`, `event_reminders`, `careers`, `ad_slots`, `business_orders`, `business_sponsorships`, `portfolio_milestones`, `ads`, `ad_events`, `business_offers`, `news_post_comments`, `discovery_events`, `openlab_posts`, trainer/member hub tables |
| Required for MVP | canonical `activities`, `moments`, `places`, `connections`, moment comments/participants with explicit visibility/owner foreign keys |
| Planned | skills, communities, map indexing/geometry, route tracking |
| Deprecated / do not extend | root `migrations/` archive and Airtable-era assumptions; `user_follows` as the semantic model for Connection |

Migrations may differ from production due to applied history and later changes. Verify tables, columns, constraints, RLS, functions, and grants against production—not merely local files—before proposing a migration.
