# Security Requirements

Status: **requirements and audit backlog; this document does not claim remediation.**

- Treat `user_metadata.slug` and role values as migration-sensitive claims; resolve canonical DB identity where authorization or ownership depends on it.
- Prevent forged ad/discovery events: authenticate or issue verifiable event context, validate payloads, rate-limit, and avoid trusting client counters.
- All mutations need CSRF, rate limit, body schema, actor/owner authorization, and safe errors (except signed webhooks).
- Review profile-save fields against explicit allowlists to prevent mass assignment.
- Keep service role server-only and minimize its call paths; no secrets or PII in logs.
- Enable/review RLS and grants for every table/function; production is the audit authority.
- Verify Square raw-body HMAC, idempotency, inventory consistency, and fulfillment reconciliation.
- Add abuse reporting/moderation, upload validation, and map-location privacy before public social launch.
