-- PetMate — Supabase Schema
-- Run this in the Supabase SQL Editor

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Profili korisnika (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  city TEXT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  bio TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  is_business BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  daily_swipe_count INT DEFAULT 0,
  last_swipe_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ljubimci
CREATE TABLE IF NOT EXISTS pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  age_years INT,
  age_months INT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  size TEXT CHECK (size IN ('small', 'medium', 'large', 'xlarge')),
  description TEXT,
  is_vaccinated BOOLEAN DEFAULT FALSE,
  is_sterilized BOOLEAN DEFAULT FALSE,
  allergies TEXT,
  interests TEXT[],
  available_for_breeding BOOLEAN DEFAULT FALSE,
  breeding_conditions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fotografije ljubimaca
CREATE TABLE IF NOT EXISTS pet_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Swipe-ovi
CREATE TABLE IF NOT EXISTS swipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  swiper_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  swiped_pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  direction TEXT CHECK (direction IN ('left', 'right')) NOT NULL,
  purpose TEXT CHECK (purpose IN ('walk', 'breeding', 'socializing', 'any')) DEFAULT 'any',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_pet_id)
);

-- Matchevi
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pet1_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  pet2_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Razgovori
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Poruke
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blokirani korisnici
CREATE TABLE IF NOT EXISTS blocked_users (
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(blocker_id, blocked_id)
);

-- Prijave korisnika
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reported_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parkovi za pse
CREATE TABLE IF NOT EXISTS dog_parks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  is_fenced BOOLEAN DEFAULT FALSE,
  has_water_fountain BOOLEAN DEFAULT FALSE,
  opening_hours TEXT,
  description TEXT,
  added_by UUID REFERENCES profiles(id),
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Veterinari
CREATE TABLE IF NOT EXISTS veterinarians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_owner_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  opening_hours JSONB,
  specializations TEXT[],
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet shopovi
CREATE TABLE IF NOT EXISTS pet_shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_owner_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  phone TEXT,
  website TEXT,
  opening_hours JSONB,
  product_types TEXT[],
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recenzije
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT CHECK (entity_type IN ('dog_park', 'veterinarian', 'pet_shop')) NOT NULL,
  entity_id UUID NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reviewer_id, entity_type, entity_id)
);

-- Prevozi
CREATE TABLE IF NOT EXISTS transports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TIME,
  available_spots INT DEFAULT 1,
  price_per_pet DECIMAL(10,2),
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'full', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rezervacije prevoza
CREATE TABLE IF NOT EXISTS transport_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transport_id UUID REFERENCES transports(id) ON DELETE CASCADE NOT NULL,
  passenger_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES pets(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(transport_id, passenger_id)
);

-- Ocene prevoza
CREATE TABLE IF NOT EXISTS transport_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES transport_bookings(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewed_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, reviewer_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_parks ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinarians ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Pets
CREATE POLICY "pets_select_all" ON pets FOR SELECT USING (true);
CREATE POLICY "pets_insert_own" ON pets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "pets_update_own" ON pets FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "pets_delete_own" ON pets FOR DELETE USING (auth.uid() = owner_id);

-- Pet photos
CREATE POLICY "pet_photos_select_all" ON pet_photos FOR SELECT USING (true);
CREATE POLICY "pet_photos_insert_owner" ON pet_photos FOR INSERT WITH CHECK (
  auth.uid() = (SELECT owner_id FROM pets WHERE id = pet_id)
);
CREATE POLICY "pet_photos_delete_owner" ON pet_photos FOR DELETE USING (
  auth.uid() = (SELECT owner_id FROM pets WHERE id = pet_id)
);
CREATE POLICY "pet_photos_update_owner" ON pet_photos FOR UPDATE USING (
  auth.uid() = (SELECT owner_id FROM pets WHERE id = pet_id)
);

-- Swipes
CREATE POLICY "swipes_own" ON swipes FOR ALL USING (auth.uid() = swiper_id);

-- Matches
CREATE POLICY "matches_participants" ON matches FOR SELECT USING (
  auth.uid() = user1_id OR auth.uid() = user2_id
);
CREATE POLICY "matches_insert" ON matches FOR INSERT WITH CHECK (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- Conversations
CREATE POLICY "conversations_participants" ON conversations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);
CREATE POLICY "conversations_insert" ON conversations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);
CREATE POLICY "conversations_update" ON conversations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

-- Messages
CREATE POLICY "messages_participants_select" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN matches m ON c.match_id = m.id
    WHERE c.id = conversation_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);
CREATE POLICY "messages_insert_participant" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN matches m ON c.match_id = m.id
    WHERE c.id = conversation_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);
CREATE POLICY "messages_update_read" ON messages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN matches m ON c.match_id = m.id
    WHERE c.id = conversation_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

-- Blocked users
CREATE POLICY "blocked_users_own" ON blocked_users FOR ALL USING (auth.uid() = blocker_id);

-- Reports
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select_own" ON reports FOR SELECT USING (auth.uid() = reporter_id);

-- Dog parks
CREATE POLICY "dog_parks_select_all" ON dog_parks FOR SELECT USING (true);
CREATE POLICY "dog_parks_insert_auth" ON dog_parks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Veterinarians
CREATE POLICY "vets_select_approved" ON veterinarians FOR SELECT USING (is_approved = true OR auth.uid() = business_owner_id);
CREATE POLICY "vets_insert_auth" ON veterinarians FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "vets_update_owner" ON veterinarians FOR UPDATE USING (auth.uid() = business_owner_id);

-- Pet shops
CREATE POLICY "shops_select_approved" ON pet_shops FOR SELECT USING (is_approved = true OR auth.uid() = business_owner_id);
CREATE POLICY "shops_insert_auth" ON pet_shops FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "shops_update_owner" ON pet_shops FOR UPDATE USING (auth.uid() = business_owner_id);

-- Reviews
CREATE POLICY "reviews_select_all" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_auth" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- Transports
CREATE POLICY "transports_select_all" ON transports FOR SELECT USING (true);
CREATE POLICY "transports_insert_own" ON transports FOR INSERT WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "transports_update_own" ON transports FOR UPDATE USING (auth.uid() = driver_id);

-- Transport bookings
CREATE POLICY "transport_bookings_select" ON transport_bookings FOR SELECT USING (
  auth.uid() = passenger_id OR
  auth.uid() = (SELECT driver_id FROM transports WHERE id = transport_id)
);
CREATE POLICY "transport_bookings_insert" ON transport_bookings FOR INSERT WITH CHECK (auth.uid() = passenger_id);
CREATE POLICY "transport_bookings_update" ON transport_bookings FOR UPDATE USING (
  auth.uid() = passenger_id OR
  auth.uid() = (SELECT driver_id FROM transports WHERE id = transport_id)
);

-- Transport reviews
CREATE POLICY "transport_reviews_select_all" ON transport_reviews FOR SELECT USING (true);
CREATE POLICY "transport_reviews_insert_own" ON transport_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- ============================================================
-- STORAGE BUCKETS (run in Dashboard or via API)
-- ============================================================
-- Create these buckets in Supabase Dashboard > Storage:
-- 1. "pet-photos" — public, max 5MB
-- 2. "chat-images" — public, max 10MB
-- 3. "avatars" — public, max 2MB

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pets_updated_at BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vets_updated_at BEFORE UPDATE ON veterinarians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER shops_updated_at BEFORE UPDATE ON pet_shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SAMPLE DATA (optional, for testing)
-- ============================================================
-- Insert a test dog park in Belgrade
INSERT INTO dog_parks (name, address, city, lat, lng, is_fenced, has_water_fountain, description)
VALUES
  ('Park Kalemegdan', 'Kalemegdanska tvrđava, Beograd', 'Beograd', 44.8247, 20.4493, false, true, 'Veliki park pogodan za šetnju pasa.'),
  ('Ada Ciganlija', 'Ada Ciganlija, Beograd', 'Beograd', 44.7878, 20.4265, false, true, 'Rečno ostrvo sa šetnicama.'),
  ('Park Košutnjak', 'Požeška 28, Beograd', 'Beograd', 44.7728, 20.4406, true, true, 'Šumski park sa posebnom zonom za pse.')
ON CONFLICT DO NOTHING;
