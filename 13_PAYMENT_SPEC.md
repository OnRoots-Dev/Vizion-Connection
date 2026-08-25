# Payment Specification

## Current flow
Business selection → order creation → Square Payment Link → Square `payment.updated` webhook → signature verification → order completion → sponsor plan update → ad slot sold increment.

## Security requirements
- Verify `x-square-hmacsha256-signature` against the configured notification URL + raw body using HMAC-SHA256.
- Validate webhook JSON with Zod.
- Ignore non-completed payments.
- Use payment ID idempotency protection.
- Do not log raw payloads or PII.

The existing webhook implements signature verification, Zod validation, Redis idempotency, order matching, plan update, and inventory increment. fileciteturn24file0L2-L6

## Order state
At minimum distinguish incomplete/pending from completed. Payment completion must not be inferred from the client.

## Inventory
A successful order increments the corresponding `ad_slots` sold count. If inventory update fails after order completion, the system must surface an operational reconciliation path; do not silently pretend the inventory is correct.

## Future
Any move to direct Square API checkout, subscriptions, refunds, or more complex fulfillment requires a separate design review.
