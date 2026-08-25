# Business Specification

## Principle
Business is a participant in the sports ecosystem, not merely an advertising slot.

## Discovery targets
Athlete, Trainer, Crew, Community, Activity, Moment, Place.

## Outcomes
Support, PR, sponsorship, collaboration.

## Current
Business plans, regional grouping, sponsor slots, ad inventory, Business checkout, sponsorship relations, and Square webhook processing exist. Current plan IDs are `roots`, `signal`, `presence`, `legacy`. fileciteturn23file0L2-L6

## Current inventory model
`ad_slots` stores prefecture/area inventory with total and sold counts. Public users may read inventory; writes are restricted. fileciteturn15file0L2-L6

## Current sponsorship model
`business_sponsorships` links a Business user to a sponsored user and plan/order context. fileciteturn16file0L2-L6

## Boundary
Vizion Connection does not currently act as a monetary contract broker between Business and sports participants. Advanced collaboration is Future/Planned.
