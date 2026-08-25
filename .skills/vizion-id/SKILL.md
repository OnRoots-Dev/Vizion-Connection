# Vizion ID Skill

## Purpose
Treat identity as the stable bridge between discovery and deeper profile information.

## Rules
- Use the canonical user slug for public routing where the existing product does.
- Never confuse database numeric `id`, auth UUID, and public `slug`.
- Respect role, visibility, deletion, and verification state.
- Reuse current public profile routes and profile data mapping.
- Keep identity information concise at first glance; progressively disclose portfolio/career/schedule/network details.

## Security
Never expose password hashes, reset tokens, private email fields, or other sensitive columns in public identity surfaces.
