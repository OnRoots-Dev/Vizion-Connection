-- Add is_onboarding_complete column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_onboarding_complete boolean DEFAULT false;

-- Update existing users to have is_onboarding_complete = true (they're already onboarded)
UPDATE users SET is_onboarding_complete = true WHERE is_onboarding_complete IS NULL;

-- Add comment
COMMENT ON COLUMN users.is_onboarding_complete IS 'Whether the user has completed the initial onboarding flow';
