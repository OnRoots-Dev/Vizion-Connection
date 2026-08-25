# Feature Specification

## Current
Authentication, profile, Journey/activity-like records, Cheer, schedules, Business checkout/webhook, ads/inventory, Discovery, dashboards, and multiple Hub surfaces exist in the repository. fileciteturn29file0L2-L7

## Planned core features
### Vizion ID
Persistent identity surface: slug, role, display name, sport, location, profile media, bio, and public/shareable identity.
### Activity
A structured recurring action with time/place/visibility and optional content/media/tags/participants.
### Moment
A meaningful piece of evidence/highlight attached to an Activity where possible.
### Viz Map
Spatial discovery of Activities, Moments, Places, and people.
### Cheer
Support action with immediate feedback and count/relationship effects.
### Comment
Contextual conversation attached to a supported object.
### Connection
Meaningful relationship distinct from Follow.
### Schedule
Upcoming/past structured time commitments.
### Open Lab
A space for experiments, collaboration, or future product/community capabilities; exact MVP behavior remains to be finalized.

## Cross-feature rules
Every feature defines owner, visibility, validation, permissions, empty/error states, analytics events if required, and security boundaries before implementation.

## Non-goal
Do not turn every object into a generic social post. Use domain objects with explicit semantics.
