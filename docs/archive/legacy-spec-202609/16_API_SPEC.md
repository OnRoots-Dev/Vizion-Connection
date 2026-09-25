# API Specification

Status: routes below are **Current** where present; endpoint behavior must be read from source before use. Planned APIs are not implemented.

| Area | Current route families | Planned |
|---|---|---|
| Auth/account | `/api/register`, login/logout, `/api/account/*`, onboarding | — |
| Profile/identity | `/api/profile/*`, career, portfolio milestones | normalized Vizion ID APIs |
| Journey/record | `/api/journey/*`, daily-log, schedules | activities, moments, places |
| Discovery/interaction | discovery, cheer, bond, collect, news comments | map query, moment comments, connections |
| Business/payment | business checkout, region availability, business-hub, Square webhook | business discovery intent |
| Operations | admin, notifications, missions, hubs, VoiceLab | moderation extensions |

New mutable APIs require authenticated actor resolution, authorization, CSRF validation, rate limiting, strict schema validation, non-PII logs, and predictable error contracts. Webhooks use signature verification rather than CSRF.
