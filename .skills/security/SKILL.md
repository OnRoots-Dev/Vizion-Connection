# Security Skill

## Before changes
Read `SECURITY.md`, relevant `.codex`/`.claude` rules, and the applicable RLS/API spec.

## Mandatory
- Never expose service-role keys.
- Never log PII or raw payment/webhook payloads.
- Validate every mutation.
- CSRF-protect applicable mutations.
- Rate-limit abuse-prone endpoints.
- Verify webhook signatures and idempotency.
- Enforce ownership and role checks server-side.
- Keep RLS enabled and narrow.
- Never use permissive public/authenticated write policies.

## Review
Test both allowed and denied cases, including non-owner, anonymous, stale session, forged event, duplicate request, and malformed input.

## Rule
Security is part of feature completion, not a later optional polish step.
