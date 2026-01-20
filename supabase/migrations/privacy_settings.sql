-- =====================================================
-- STATS_APP Privacy Settings - Supabase Migration
-- Execute this in your Supabase SQL Editor or via CLI
-- =====================================================

-- 1. Table: privacy_settings (Paramètres de confidentialité par utilisateur)
CREATE TABLE IF NOT EXISTS privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Paramètres de confidentialité par catégorie
  -- false = données privées (visible uniquement par l'utilisateur)
  -- true = données publiques (visible par les amis)
  finance_public BOOLEAN DEFAULT false,
  physio_public BOOLEAN DEFAULT false,
  world_public BOOLEAN DEFAULT false,
  career_public BOOLEAN DEFAULT false,
  social_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own privacy settings
CREATE POLICY "Users can CRUD own privacy settings" ON privacy_settings
  FOR ALL USING (auth.uid() = user_id);

-- Policy: Friends can view privacy settings (to know what data they can access)
CREATE POLICY "Friends can view privacy settings" ON privacy_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE (friendships.user_id = auth.uid() AND friendships.friend_id = privacy_settings.user_id)
         OR (friendships.friend_id = auth.uid() AND friendships.user_id = privacy_settings.user_id)
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON privacy_settings(user_id);

-- =====================================================
-- Update existing RLS policies for travel module
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Friends can view countries" ON user_countries;
DROP POLICY IF EXISTS "Friends can view trips" ON user_trips;
DROP POLICY IF EXISTS "Friends can view cities" ON user_cities;

-- New policy: Friends can view countries ONLY if world_public = true
CREATE POLICY "Friends can view countries if public" ON user_countries
  FOR SELECT USING (
    user_id = auth.uid() -- Owner can always see their own data
    OR
    EXISTS (
      SELECT 1 FROM friendships f
      JOIN privacy_settings ps ON ps.user_id = user_countries.user_id
      WHERE ((f.user_id = auth.uid() AND f.friend_id = user_countries.user_id)
         OR (f.friend_id = auth.uid() AND f.user_id = user_countries.user_id))
        AND ps.world_public = true
    )
  );

-- New policy: Friends can view trips ONLY if world_public = true
CREATE POLICY "Friends can view trips if public" ON user_trips
  FOR SELECT USING (
    user_id = auth.uid() -- Owner can always see their own data
    OR
    EXISTS (
      SELECT 1 FROM friendships f
      JOIN privacy_settings ps ON ps.user_id = user_trips.user_id
      WHERE ((f.user_id = auth.uid() AND f.friend_id = user_trips.user_id)
         OR (f.friend_id = auth.uid() AND f.user_id = user_trips.user_id))
        AND ps.world_public = true
    )
  );

-- New policy: Friends can view cities ONLY if world_public = true
CREATE POLICY "Friends can view cities if public" ON user_cities
  FOR SELECT USING (
    user_id = auth.uid() -- Owner can always see their own data
    OR
    EXISTS (
      SELECT 1 FROM friendships f
      JOIN privacy_settings ps ON ps.user_id = user_cities.user_id
      WHERE ((f.user_id = auth.uid() AND f.friend_id = user_cities.user_id)
         OR (f.friend_id = auth.uid() AND f.user_id = user_cities.user_id))
        AND ps.world_public = true
    )
  );

-- =====================================================
-- Helper function to initialize privacy settings for new users
-- =====================================================

-- Function to create default privacy settings on user signup
CREATE OR REPLACE FUNCTION create_default_privacy_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO privacy_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create privacy settings when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_privacy_settings();

-- Backfill existing users with default privacy settings
INSERT INTO privacy_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
