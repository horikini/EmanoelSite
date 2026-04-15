-- SQL Schema for ELS POWER App

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  dob DATE,
  city TEXT,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  target_training TEXT,
  position1 TEXT,
  position2 TEXT,
  photo TEXT,
  role TEXT DEFAULT 'athlete' CHECK (role IN ('admin', 'athlete')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked'))
);

-- 2. Monitoring Table
CREATE TABLE monitoring (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pain INTEGER CHECK (pain >= 0 AND pain <= 10),
  fatigue INTEGER CHECK (fatigue >= 0 AND fatigue <= 10),
  hydration TEXT,
  status TEXT
);

-- 3. Appointments Table
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'canceled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Evaluations Table (Simplified for now, can be expanded)
CREATE TABLE evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  is_liberated BOOLEAN DEFAULT FALSE,
  data JSONB NOT NULL, -- Stores weight, height, measurements, skinfolds, specificTests
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read all profiles (for admin/search), but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Monitoring: Athletes can see/add their own, admins can see all
CREATE POLICY "Athletes can view own monitoring" ON monitoring FOR SELECT USING (auth.uid() = athlete_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Athletes can insert own monitoring" ON monitoring FOR INSERT WITH CHECK (auth.uid() = athlete_id);

-- Appointments: Athletes can see their own, admins can see/manage all
CREATE POLICY "Users can view own appointments" ON appointments FOR SELECT USING (auth.uid() = athlete_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can manage appointments" ON appointments FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Evaluations: Athletes can see their own (if liberated), admins can see/manage all
CREATE POLICY "Athletes can view own liberated evaluations" ON evaluations FOR SELECT USING ((auth.uid() = athlete_id AND is_liberated = true) OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can manage evaluations" ON evaluations FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 5. Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'athlete');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
