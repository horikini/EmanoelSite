-- SQL Script to create missing tables
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for them or by them" ON messages FOR SELECT USING (auth.uid() = athlete_id OR auth.uid() = author_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can insert messages" ON messages FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE TABLE IF NOT EXISTS access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own access logs" ON access_logs FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users can insert own access logs" ON access_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
