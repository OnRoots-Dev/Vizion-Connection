# Security Requirements

## Current critical controls
1. RLS on production data.
2. Service-role keys server-only.
3. CSRF + rate limit + body validation for mutating APIs.
4. PII-safe logging.
5. Destructive SQL requires human approval.
6. Secrets must come from environment variables.
7. Migrations live under `supabase/migrations/`.
8. `user.id` and `user.slug` must never be confused.

These controls are already documented as repository-wide rules. fileciteturn7file0L1-L6

## Known audit issues/history
The June 2026 audit documents prior privilege escalation through `users`, journey tampering, schedule private-row leakage, career profile overexposure, and broken ownership predicates; those remediations are part of the permanent baseline. fileciteturn27file0L2-L2

## Current implementation concerns
- Maintain strict webhook HMAC verification and idempotency.
- Protect admin mutations.
- Validate profile/save inputs against an allowlist to avoid mass assignment.
- Do not trust ad event payloads from clients.
- Rate-limit high-frequency social actions.

## Public-release gate
No known Critical/High security issue may remain open at release. Security changes must be tested with authenticated and unauthenticated clients and relevant RLS policies.

## Scope of this spec task
Document requirements only. Do not fix security issues, change migrations, or modify auth in this phase.
