-- =====================================================
-- STATS_APP Travel Module - Supabase Migration
-- Execute this in your Supabase SQL Editor
-- =====================================================

-- 1. Table: user_countries (Pays visités)
CREATE TABLE IF NOT EXISTS user_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  first_visit_year INTEGER,
  last_visit_year INTEGER,
  visit_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, country_code)
);

ALTER TABLE user_countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own countries" ON user_countries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Friends can view countries" ON user_countries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE (friendships.user_id = auth.uid() AND friendships.friend_id = user_countries.user_id)
         OR (friendships.friend_id = auth.uid() AND friendships.user_id = user_countries.user_id)
    )
  );

CREATE INDEX IF NOT EXISTS idx_user_countries_user_id ON user_countries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_countries_country_code ON user_countries(country_code);

-- 2. Table: user_trips (Voyages avec photos)
CREATE TABLE IF NOT EXISTS user_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  city_name TEXT,
  year INTEGER NOT NULL,
  month INTEGER CHECK (month >= 1 AND month <= 12),
  photo_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own trips" ON user_trips
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Friends can view trips" ON user_trips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE (friendships.user_id = auth.uid() AND friendships.friend_id = user_trips.user_id)
         OR (friendships.friend_id = auth.uid() AND friendships.user_id = user_trips.user_id)
    )
  );

CREATE INDEX IF NOT EXISTS idx_user_trips_user_id ON user_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trips_country_code ON user_trips(country_code);
CREATE INDEX IF NOT EXISTS idx_user_trips_year ON user_trips(year);

-- 3. Table: user_cities (Villes du Top 200)
CREATE TABLE IF NOT EXISTS user_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_id TEXT NOT NULL,
  city_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  visit_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, city_id)
);

ALTER TABLE user_cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own cities" ON user_cities
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Friends can view cities" ON user_cities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE (friendships.user_id = auth.uid() AND friendships.friend_id = user_cities.user_id)
         OR (friendships.friend_id = auth.uid() AND friendships.user_id = user_cities.user_id)
    )
  );

CREATE INDEX IF NOT EXISTS idx_user_cities_user_id ON user_cities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cities_city_id ON user_cities(city_id);

-- 4. Create Storage bucket for trip photos (run in Storage settings or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('trip-photos', 'trip-photos', true);
