-- Add is_onboarding_complete flag to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_onboarding_complete boolean NOT NULL DEFAULT false;
