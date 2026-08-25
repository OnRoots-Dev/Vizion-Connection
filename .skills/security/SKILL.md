# Security Skill

For every mutation: authenticate, authorize, validate CSRF (except signed webhooks), rate-limit, parse with a strict schema, allowlist writable fields, and log no PII/secrets. Enable/test RLS and grants; service role stays server-only. Treat metadata claims carefully, verify Square HMAC/raw-body/idempotency, and test owner/non-owner/admin/replay paths. Read `17_SECURITY_REQUIREMENTS.md` and existing local security rules before changes.
