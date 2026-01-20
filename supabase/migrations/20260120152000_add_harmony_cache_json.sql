-- Add JSON column for caching full AI response
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS harmony_analysis_cache JSONB;
