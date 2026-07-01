-- Remove the deprecated "roots_plus" sponsor plan from the allowed set.
-- No data migration is required: no rows currently hold sponsor_plan = 'roots_plus'.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_sponsor_plan_check;

ALTER TABLE users
ADD CONSTRAINT users_sponsor_plan_check
CHECK (sponsor_plan IN ('roots','signal','presence','legacy'));
