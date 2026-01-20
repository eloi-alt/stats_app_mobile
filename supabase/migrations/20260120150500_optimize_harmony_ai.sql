-- Add columns for Harmony AI optimization (caching)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS harmony_data_hash TEXT,
ADD COLUMN IF NOT EXISTS harmony_last_analyzed_at TIMESTAMP WITH TIME ZONE;
