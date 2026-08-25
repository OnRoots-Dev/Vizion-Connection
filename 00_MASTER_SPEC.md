# Vizion Connection — Master Specification

Status: **Current + MVP/Planned design authority**. This is the sole top-level product specification; numbered specifications refine it.

## Product identity

Vizion Connection is a Japanese sports platform where athletes, trainers, crew, and businesses make sports activity visible, discover one another, and form meaningful support relationships. **Sports activity becomes visible.**

## Core loop

`Viz Map → Activity → Moment → Cheer / Comment / Connection → Discovery → Activity`

The loop is product-first. A Portfolio/Vizion ID explains someone after discovery; it is not the primary acquisition loop.

## Core objects

| Object | Status | Canonical meaning |
|---|---|---|
| Vizion ID, Profile, Portfolio | Current | Public identity and accumulated record; current models use `users`, careers, and journeys. |
| Activity, Moment, Viz Map, Place, Connection | Planned / MVP | Activity is the recurring action; Moment is a publishable outcome; Viz Map is spatial discovery; Connection is a mutual relationship. |
| Schedule | Current | Dated schedule/event records. |
| Cheer | Current | An encouragement reaction, never generic “Like” copy. |
| Comment | Current (News); Planned (Moments) | Contextual conversation. |
| Skill, Community | Planned | Capability and group discovery. |
| Business, Open Lab | Current in limited form / Planned product expansion | Business hubs, offers, sponsorships, ads and VoiceLab/Open Lab posts exist. |

## Roles

Athlete, Trainer, Crew, and Business are product roles. Admin is an operational role, not a public product persona.

## MVP principles

- Prefer the smallest coherent flow whose value is obvious at a glance.
- Make Activity place-aware with minimal input; make moments and people discoverable from it.
- Reuse current profile, Journey, Schedule, Cheer, Business, and Square capabilities where boundaries fit.
- Design for public/private visibility, owner control, and safe defaults.

## Non-goals

- A generic all-purpose social network, cloned follow graph, or long-form posting product.
- Live route tracking, contract brokerage, escrow, and guaranteed sponsorship matching.
- Mapbox integration, database migrations, or large application rewrites in this documentation phase.

## Status vocabulary

**Current** is observable code/schema behavior. **MVP** is the release minimum. **Planned** has an intended design but is not built. **Future** is explicitly deferred. **Deprecated** must not receive new dependencies.
