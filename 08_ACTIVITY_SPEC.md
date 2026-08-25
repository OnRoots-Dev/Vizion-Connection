# Activity Specification

Status: **Planned MVP.** Activity is the recurring sport action a user should keep doing; it is not a generic social post.

Required fields: `type`, `starts_at` (date/time), `place` or deliberate no-place state, and `visibility`. Optional fields: title, short description, media, tags, participants. Owner and creation/update timestamps are required at persistence.

Rules: place-aware when possible; minimal selection-first input; reusable as a Moment source; visibility filters all reads/map exposure; edit/delete owner-only; preserve historical Moment references. Use presets and remembered values. Avoid long forms and unnecessary metadata. Existing `daily_logs`, `journeys`, `schedules`, and `events` are adjacent **Current** models, not proof that the canonical Activity model exists.
