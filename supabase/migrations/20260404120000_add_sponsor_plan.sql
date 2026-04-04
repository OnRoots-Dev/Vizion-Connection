ALTER TABLE users
ADD COLUMN IF NOT EXISTS sponsor_plan TEXT
CHECK (sponsor_plan IN ('roots','roots_plus','signal','presence','legacy'));
