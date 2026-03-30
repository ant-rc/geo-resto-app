-- ============================================================
-- Tastly — Full Supabase Initialization
-- Run this ONCE in Supabase SQL Editor
-- https://supabase.com/dashboard/project/yrijzmjgwcngxxgmkzod/editor
-- ============================================================

-- 1. Create tables

-- Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  address text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  phone text,
  website text,
  price_range integer DEFAULT 2,
  cuisine_type text[] DEFAULT '{}',
  opening_hours jsonb,
  image_url text,
  images text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  rating double precision,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profiles (users + restaurateurs + admins)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'restaurateur', 'admin')),
  preferences jsonb DEFAULT '{"cuisineTypes":[],"priceRange":[1,4],"maxDistance":5,"onboardingCompleted":false}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Restaurant stats (analytics pour restaurateurs)
CREATE TABLE IF NOT EXISTS restaurant_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('view', 'click', 'favorite', 'reservation', 'call')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  party_size integer NOT NULL DEFAULT 2,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Promotions (restaurateurs)
CREATE TABLE IF NOT EXISTS promotions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  discount_percent integer CHECK (discount_percent >= 0 AND discount_percent <= 100),
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_restaurants_tags ON restaurants USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_type ON restaurants USING GIN (cuisine_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_stats_restaurant ON restaurant_stats(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant ON reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_promotions_restaurant ON promotions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 3. RLS Policies
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Restaurants: readable by all, editable by owner or admin
DROP POLICY IF EXISTS "Restaurants are viewable by everyone" ON restaurants;
CREATE POLICY "Restaurants are viewable by everyone"
  ON restaurants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can update own restaurants" ON restaurants;
CREATE POLICY "Owners can update own restaurants"
  ON restaurants FOR UPDATE USING (
    auth.uid() = owner_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Owners can insert restaurants" ON restaurants;
CREATE POLICY "Owners can insert restaurants"
  ON restaurants FOR INSERT WITH CHECK (
    auth.uid() = owner_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('restaurateur', 'admin'))
  );

-- Profiles: users can read own, admins can read all
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Favorites: users manage their own
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Reviews: readable by all, writable by owner
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
CREATE POLICY "Users can insert own reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Stats: insertable by all authenticated, readable by restaurant owner or admin
DROP POLICY IF EXISTS "Authenticated users can insert stats" ON restaurant_stats;
CREATE POLICY "Authenticated users can insert stats"
  ON restaurant_stats FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Owners can view own restaurant stats" ON restaurant_stats;
CREATE POLICY "Owners can view own restaurant stats"
  ON restaurant_stats FOR SELECT USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = restaurant_id AND restaurants.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Reservations: user can manage own, restaurateur can view for own restaurants
DROP POLICY IF EXISTS "Users can manage own reservations" ON reservations;
CREATE POLICY "Users can manage own reservations"
  ON reservations FOR ALL USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = restaurant_id AND restaurants.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Promotions: readable by all, manageable by owner
DROP POLICY IF EXISTS "Promotions are viewable by everyone" ON promotions;
CREATE POLICY "Promotions are viewable by everyone"
  ON promotions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage promotions" ON promotions;
CREATE POLICY "Owners can manage promotions"
  ON promotions FOR ALL USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = restaurant_id AND restaurants.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Helper: promote user to admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_email text)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET role = 'admin' WHERE email = target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Helper: promote user to restaurateur and assign restaurant
CREATE OR REPLACE FUNCTION public.promote_to_restaurateur(target_email text, target_restaurant_id uuid)
RETURNS void AS $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id FROM profiles WHERE email = target_email;
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: %', target_email;
  END IF;
  UPDATE profiles SET role = 'restaurateur' WHERE id = target_user_id;
  UPDATE restaurants SET owner_id = target_user_id WHERE id = target_restaurant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Seed restaurants data
INSERT INTO restaurants (id, name, description, address, latitude, longitude, phone, website, price_range, cuisine_type, image_url, images, tags, rating) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Le Comptoir du Marais', 'Bistrot parisien chaleureux au coeur du Marais. Cuisine francaise traditionnelle revisitee avec des produits frais du marche.', '38 Rue des Francs-Bourgeois, 75003 Paris', 48.8582, 2.3621, '+33 1 42 72 31 22', 'https://www.lecomptoirdumarais.fr', 3, ARRAY['Francais', 'Bistrot'], 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop'], ARRAY['terrasse', 'romantique'], 4.5),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Sakura Ramen', 'Ramen authentique dans le quartier japonais de Paris. Bouillons prepares pendant 12h, nouilles fraiches maison.', '14 Rue Sainte-Anne, 75001 Paris', 48.8670, 2.3365, '+33 1 47 03 38 59', NULL, 2, ARRAY['Japonais', 'Ramen'], 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop'], ARRAY['halal', 'fast'], 4.7),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Green Garden', 'Restaurant 100% vegan et bio. Tout est fait maison a partir de produits locaux et de saison.', '42 Rue de Charonne, 75011 Paris', 48.8534, 2.3769, '+33 1 43 55 87 21', 'https://www.greengarden.paris', 2, ARRAY['Vegan', 'Bio'], 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop'], ARRAY['vegan', 'bio', 'brunch', 'sans gluten'], 4.8),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'La Trattoria Romana', 'Cuisine italienne authentique. Pates fraiches faites maison chaque jour, pizzas au feu de bois.', '8 Rue de Seine, 75006 Paris', 48.8557, 2.3378, '+33 1 43 26 40 15', 'https://www.trattoriaromana.fr', 3, ARRAY['Italien', 'Pizza'], 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop'], ARRAY['terrasse', 'famille', 'romantique'], 4.3),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Brunch & Bloom', 'Brunch gourmand du matin au soir. Pancakes, avocado toast, oeufs Benedict et jus frais.', '15 Rue des Abbesses, 75018 Paris', 48.8845, 2.3384, '+33 1 42 58 91 03', NULL, 2, ARRAY['Brunch', 'Cafe'], 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop'], ARRAY['brunch', 'vegan', 'terrasse'], 4.6),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Maison Kamoun', 'Cuisine libanaise familiale. Mezze genereux, grillades au charbon, houmous onctueux fait minute.', '10 Rue de Belleville, 75020 Paris', 48.8722, 2.3830, '+33 1 46 36 72 55', 'https://www.maisonkamoun.fr', 1, ARRAY['Libanais', 'Mezze'], 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&h=600&fit=crop'], ARRAY['halal', 'famille', 'livraison'], 4.4),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Le Bosphore', 'Grillades turques et kebabs artisanaux. Viandes marinees 24h, pains cuits au four.', '22 Rue du Faubourg Saint-Denis, 75010 Paris', 48.8738, 2.3557, '+33 1 42 46 33 18', NULL, 1, ARRAY['Turc', 'Grillade'], 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'], ARRAY['halal', 'fast', 'livraison'], 4.1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 'Bollywood Masala', 'Saveurs indiennes authentiques. Tandoori, curry maison, naans au fromage et lassi.', '35 Passage Brady, 75010 Paris', 48.8715, 2.3515, '+33 1 47 70 55 02', NULL, 1, ARRAY['Indien', 'Curry'], 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop'], ARRAY['halal', 'livraison', 'famille'], 4.2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567809', 'Chez Janou', 'Institution du Marais. Cuisine provencale, mousse au chocolat legendaire et terrasse ombragee.', '2 Rue Roger Verlomme, 75003 Paris', 48.8570, 2.3655, '+33 1 42 72 28 41', 'https://www.chezjanou.com', 3, ARRAY['Francais', 'Provencal'], 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop'], ARRAY['terrasse', 'romantique'], 4.6),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'L''Atelier Vegetal', 'Gastronomie vegetale creative. Menu degustation surprenant qui change chaque semaine.', '5 Rue Oberkampf, 75011 Paris', 48.8647, 2.3712, '+33 1 43 57 65 88', 'https://www.ateliervegetal.fr', 4, ARRAY['Vegan', 'Gastronomique'], 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop'], ARRAY['vegan', 'bio', 'sans gluten'], 4.9),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567811', 'Chez Alain', 'Steakhouse parisien. Viandes maturees, frites maison et sauces bearnaise.', '18 Rue Mouffetard, 75005 Paris', 48.8442, 2.3497, '+33 1 43 31 18 42', NULL, 3, ARRAY['Francais', 'Steakhouse'], 'https://images.unsplash.com/photo-1600891964599-f94d51f9e8b7?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1600891964599-f94d51f9e8b7?w=800&h=600&fit=crop'], ARRAY['terrasse'], 4.3),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567812', 'Seoul Kitchen', 'Street food coreenne. Bibimbap, korean fried chicken, kimchi fait maison.', '7 Rue de Turbigo, 75001 Paris', 48.8620, 2.3510, '+33 1 42 33 90 77', NULL, 2, ARRAY['Coreen', 'Street Food'], 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop', ARRAY['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'], ARRAY['fast', 'livraison'], 4.5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 8. SETUP ACCOUNTS
-- After running this SQL, create these accounts via the app:
--
-- ADMIN:
--   Email: admin@tastly.fr / Password: admin123
--   Then run: SELECT promote_to_admin('admin@tastly.fr');
--
-- RESTAURATEUR:
--   Email: resto@tastly.fr / Password: resto123
--   Then run: SELECT promote_to_restaurateur('resto@tastly.fr', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801');
--   (This assigns "Le Comptoir du Marais" to this restaurateur)
--
-- USER:
--   Email: user@tastly.fr / Password: user123
--   (Default role: 'user')
-- ============================================================
