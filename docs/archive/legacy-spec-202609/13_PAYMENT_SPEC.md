# Payment Specification

Status: **Current Square Payment Link flow; audit production configuration before changing it.**

1. Business checkout validates session, CSRF, input, plan and `ad_slots` availability.
2. Server creates/saves a pending order and Square Payment Link with a non-PII `payment.note` correlation value.
3. Square webhook verifies HMAC signature over the raw body, accepts completed payments, finds the order, and marks it completed.
4. Processed payment identity is stored in Redis for idempotency; inventory is incremented only once.

Known risk: the completion fallback notes a possible webhook race and depends on payment-id Redis idempotency. Production reconciliation, durable idempotency, atomic inventory reservation, webhook retry handling, and order-state transitions require a dedicated hardening decision. Never trust a browser return URL as payment proof.
