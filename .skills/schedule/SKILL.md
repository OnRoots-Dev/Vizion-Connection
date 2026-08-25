# Schedule Skill

## Purpose
Represent time-bound sports activity and commitments.

## Current model
`schedules` currently contains user slug, title, start/end timestamps, location, description, category, public flag, and timestamps. Categories are `match | practice | event | other`. fileciteturn14file0L2-L6

## Rules
- Respect timezone semantics.
- Public/private visibility must be explicit.
- Owner-only mutation.
- Reuse existing Schedule UI and API.
- Do not create a parallel calendar model for Activity until the relationship between Activity and Schedule is approved.
