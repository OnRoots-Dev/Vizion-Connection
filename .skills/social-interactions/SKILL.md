# Social Interactions Skill

## Cheer
Use existing Cheer implementation. Semantics are support/encouragement, not merely Like. Provide immediate feedback and protect against duplicate/spam abuse.

## Comment
Validate length/content and ownership. Keep comments attached to a clear domain object.

## Connection
Do not reuse Follow semantics without an explicit product decision. Connection must have a defined state model before implementation.

## General
Authenticate mutations, validate inputs, rate-limit high-frequency actions, preserve idempotency where needed, and never leak private data.

## UI
Use existing interaction tokens; stronger celebration is allowed for successful Cheer/Connection states with reduced-motion fallback.
