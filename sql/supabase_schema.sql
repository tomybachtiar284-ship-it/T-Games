-- Supabase Database Schema for T-Games Smart Challenge

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  avatar TEXT DEFAULT '🧑‍💻',
  school TEXT DEFAULT 'Komunitas T-Games Digital',
  selected_character_id TEXT DEFAULT 'char_rizky',
  unlocked_characters TEXT[] DEFAULT '{char_rizky, char_nayla}',
  coins INTEGER DEFAULT 0,
  play_points INTEGER DEFAULT 10,
  total_score INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  highest_level INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_wrong INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  subscription_type TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  subscription_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  match_history JSONB DEFAULT '[]'::jsonb
);

-- Add columns if profiles table already existed
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selected_character_id TEXT DEFAULT 'char_rizky';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unlocked_characters TEXT[] DEFAULT '{char_rizky, char_nayla}';
-- Subscription & Match History columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS match_history JSONB DEFAULT '[]'::jsonb;

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. LEADERBOARD ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  name TEXT NOT NULL,
  school TEXT DEFAULT 'Komunitas T-Games Digital',
  score INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  category TEXT DEFAULT 'Master',
  avatar TEXT DEFAULT '🧑‍💻',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS for leaderboard
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leaderboard entries are viewable by everyone" ON public.leaderboard_entries;
CREATE POLICY "Leaderboard entries are viewable by everyone" ON public.leaderboard_entries
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert leaderboard entries" ON public.leaderboard_entries;
CREATE POLICY "Authenticated users can insert leaderboard entries" ON public.leaderboard_entries
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. TRIGGER FOR AUTOMATIC PROFILE CREATION ON GOOGLE OAUTH SIGN IN
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar, school, selected_character_id, unlocked_characters)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Pemain T-Games'),
    new.email,
    '🧑‍💻',
    'Komunitas T-Games Digital',
    'char_rizky',
    ARRAY['char_rizky', 'char_nayla']
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. CUSTOM QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.custom_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer_index INTEGER NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS for custom_questions
ALTER TABLE public.custom_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Questions viewable by everyone" ON public.custom_questions;
CREATE POLICY "Questions viewable by everyone" ON public.custom_questions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Everyone can insert custom questions" ON public.custom_questions;
CREATE POLICY "Everyone can insert custom questions" ON public.custom_questions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Everyone can delete custom questions" ON public.custom_questions;
CREATE POLICY "Everyone can delete custom questions" ON public.custom_questions
  FOR DELETE USING (true);

DROP POLICY IF EXISTS "Everyone can update custom questions" ON public.custom_questions;
CREATE POLICY "Everyone can update custom questions" ON public.custom_questions
  FOR UPDATE USING (true);

-- 5. SPONSORS TABLE
CREATE TABLE IF NOT EXISTS public.sponsors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  logo_text TEXT NOT NULL,
  slogan TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS for sponsors
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sponsors viewable by everyone" ON public.sponsors;
CREATE POLICY "Sponsors viewable by everyone" ON public.sponsors
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage sponsors" ON public.sponsors;
CREATE POLICY "Authenticated users can manage sponsors" ON public.sponsors
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed initial sponsors
INSERT INTO public.sponsors (id, name, logo_text, slogan, active)
VALUES 
  ('sp_1', 'Telkomsel', 'TELKOMSEL', 'Jaringan Terluas Kemerdekaan', true),
  ('sp_2', 'Indomie', 'INDOMIE', 'Indomie Seleraku', true),
  ('sp_3', 'Bank BNI', 'BANK BNI', 'Melayani Negeri', true),
  ('sp_4', 'Kemdikbud', 'KEMDIKBUD', 'Merdeka Belajar Matematika', true)
ON CONFLICT (id) DO NOTHING;

-- 6. CHARACTERS TABLE
CREATE TABLE IF NOT EXISTS public.characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT DEFAULT 'laki',
  role TEXT,
  emoji TEXT NOT NULL,
  avatar_bg TEXT DEFAULT 'bg-indigo-600',
  unlocked BOOLEAN DEFAULT false,
  cost_coins INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS for characters
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Characters viewable by everyone" ON public.characters;
CREATE POLICY "Characters viewable by everyone" ON public.characters
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage characters" ON public.characters;
CREATE POLICY "Authenticated users can manage characters" ON public.characters
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed initial characters
INSERT INTO public.characters (id, name, gender, role, emoji, avatar_bg, unlocked, cost_coins, description)
VALUES 
  ('char_rizky', 'Arya Tech', 'laki', 'Remaja Tech & Gamer', '🧑‍💻', 'bg-indigo-600', true, 0, 'Remaja digital yang gemar logika matematika dan analisis cepat.'),
  ('char_nayla', 'Nayla', 'perempuan', 'Siswi SMA Cerdas', '👩‍🎓', 'bg-rose-500', true, 0, 'Siswi SMA berprestasi yang sangat fokus dan cermat menyelesaikan tantangan.'),
  ('char_kenzie', 'Kenzie', 'laki', 'Remaja Atletik & Cool', '🧢', 'bg-blue-600', false, 200, 'Remaja energik bertopi yang cepat dalam berhitung dan punya refleks tinggi.'),
  ('char_zahra', 'Zahra', 'perempuan', 'Mahasiswi Genius Logika', '🕶️', 'bg-emerald-600', false, 500, 'Master matematika muda bergaya kasual dengan kemampuan analisis tingkat tinggi.')
ON CONFLICT (id) DO NOTHING;



