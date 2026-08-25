# Activity Specification

## Definition
Activity is the core recurring action of Vizion Connection. It represents something a person or organization actually does in sport; it is not a generic status post.

## Required fields
- Type
- Date
- Time
- Place
- Visibility

## Optional fields
Title, description, media, tags, participants.

## UX rules
- Prefer presets and selections over long text input.
- Place-aware where possible.
- Reusable as a source/context for Moment.
- Easy to repeat or edit.
- Visibility must be explicit.
- Avoid unnecessary metadata.

## Current mapping
The production database currently models activity-like records as `journeys`; the current `JourneyEntry` has content, condition score, media, tags, visibility, cheer count, and timestamps. fileciteturn20file0L2-L6 The RLS hardening migration explicitly maps `activities` conceptually to `public.journeys` because an `activities` table does not currently exist. fileciteturn17file0L1-L2

## Status
- Current: Journey activity-like records and APIs.
- MVP: Activity UX over the existing foundation.
- Planned: deliberate terminology/schema unification.
- Future: richer tracking and route data.
