# MVP Scope

## Must
- Authentication and account lifecycle
- Profile and public profile
- Vizion ID / identity surface
- Activity (implemented through current Journey foundation until migration)
- Moment foundation
- Viz Map foundation
- Cheer
- Comment foundation
- Connection foundation
- Schedule
- Open Lab foundation
- Business discovery/foundation
- Existing Square payment flow

## Should
- Skill representation
- Community foundation
- richer Discovery ranking/filtering
- Activity presets and place picker
- Moment templates
- notification surfaces

## Later
- Advanced map layers
- Route/course tracking
- Strava-like tracking
- advanced Business collaboration
- advanced Community systems

## Existing-first constraint
Current repository already contains auth, profile, Journey, Cheer, schedules, Business and payment functionality. The MVP must reuse these foundations rather than replacing them. `package.json` confirms Next 16.2.4, React 19.2.3, Supabase SSR/JS, Framer Motion, GSAP, Zod, Zustand and other existing dependencies. fileciteturn2file0L1-L6

## Release gate
A feature is MVP-ready only when its happy path, permissions, validation, error state, accessibility, responsive behavior, and relevant security checks are defined.
