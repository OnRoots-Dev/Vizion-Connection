# Existing Code Skill

## Purpose
Prevent duplicate or destructive implementation.

## Before coding
Search for route, component, feature, type, validation, API, DB table, RPC, and migration that already serves the requirement.

## Rules
- Prefer existing implementation.
- Read local `AGENTS.md`, security rules, and relevant Skill.
- Check `docs/project-structure.md` before structural changes.
- Treat production DB as truth.
- Preserve compatibility unless a migration is intentional and approved.
- Do not create a parallel `activities` system while `journeys` is the current activity foundation.
- Record uncertainty instead of inventing behavior.

## After coding
Inspect diff, run type/lint/build checks, and test the affected path.
