-- ============================================
-- REYNAR WEALTH - SUPABASE DATABASE SCHEMA
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- Dashboard > SQL Editor > New Query

-- ==================== PROFILES ====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  monthly_salary DECIMAL(12,2),
  privacy_mode BOOLEAN DEFAULT FALSE,
  plan TEXT DEFAULT 'basic',
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  next_level_xp INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ==================== TRANSACTIONS ====================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  receipt_url TEXT,
  is_pending BOOLEAN DEFAULT FALSE,
  card_id UUID,
  installment_current INTEGER,
  installment_total INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- ==================== BILLS ====================
CREATE TABLE IF NOT EXISTS bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  category TEXT,
  is_recurrent BOOLEAN DEFAULT FALSE,
  recurrence_frequency TEXT CHECK (recurrence_frequency IN ('monthly', 'yearly')),
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own bills" ON bills FOR ALL USING (auth.uid() = user_id);

-- ==================== INVESTMENTS ====================
CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  asset_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Ações', 'Cripto', 'Renda Fixa', 'FIIs')),
  amount_invested DECIMAL(12,2) NOT NULL,
  current_value DECIMAL(12,2) NOT NULL,
  performance DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own investments" ON investments FOR ALL USING (auth.uid() = user_id);

-- ==================== GOALS ====================
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  deadline TIMESTAMPTZ NOT NULL,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT 'bg-primary',
  notes TEXT,
  history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);

-- ==================== CREDIT CARDS ====================
CREATE TABLE IF NOT EXISTS cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  last4_digits TEXT DEFAULT '****',
  card_limit DECIMAL(12,2) NOT NULL,
  closing_day INTEGER DEFAULT 1,
  due_day INTEGER DEFAULT 10,
  brand TEXT CHECK (brand IN ('mastercard', 'visa', 'amex')),
  color_gradient TEXT DEFAULT 'from-zinc-700 to-zinc-900',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cards" ON cards FOR ALL USING (auth.uid() = user_id);

-- ==================== LOANS ====================
CREATE TABLE IF NOT EXISTS loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  borrower_name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  date_lent TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own loans" ON loans FOR ALL USING (auth.uid() = user_id);

-- ==================== STORAGE BUCKETS ====================
-- Execute separadamente ou pelo Dashboard > Storage

-- Bucket para fotos de boletos
INSERT INTO storage.buckets (id, name, public) VALUES ('bill-images', 'bill-images', true);

-- Bucket para avatares
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Policies for storage
CREATE POLICY "Users can upload bill images" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'bill-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view bill images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'bill-images');

CREATE POLICY "Users can delete own bill images" ON storage.objects 
  FOR DELETE USING (bucket_id = 'bill-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload avatars" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view avatars" ON storage.objects 
  FOR SELECT USING (bucket_id = 'avatars');

-- ==================== AUTO-CREATE PROFILE ====================
-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
