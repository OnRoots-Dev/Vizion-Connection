# User Roles

## Athlete
Purpose: make sporting activity, progress, events, and identity visible. Typical Activity: practice, match, tournament, event, training block.

## Trainer
Purpose: make coaching, sessions, expertise, and activity visible. Typical Activity: coaching session, clinic, event, program.

## Crew
Purpose: participate in and support sports. Typical Activity: spectating, supporting, attending, community participation.

## Business
Purpose: participate in the sports ecosystem through discovery, sponsorship, PR, and collaboration. Business also needs identity and activity-like presence, not only ad inventory.

## Admin
Operational role for moderation and administration. Not part of the four primary product personas.

## Current role source
`features/auth/types.ts` currently defines `Athlete | Trainer | Crew | Business | Admin`. fileciteturn25file0L1-L2

## Permission model
Role controls product capability, but ownership controls data access. Never use role alone as proof of ownership. Admin actions require explicit server-side authorization.
