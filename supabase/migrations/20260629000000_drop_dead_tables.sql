-- Migration: drop dead tables (code reference = 0)
-- Dropped tables: verify_tokens, event_reminders, event_invites, events, careers
-- event_invites / event_reminders reference events.id → drop children first

DROP TABLE IF EXISTS public.event_reminders CASCADE;
DROP TABLE IF EXISTS public.event_invites CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.verify_tokens CASCADE;
DROP TABLE IF EXISTS public.careers CASCADE;
