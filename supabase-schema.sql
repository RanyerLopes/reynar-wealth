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

-- ==================== KNOWN ASSETS (Stocks & Crypto) ====================
-- Public table for validating and autocompleting asset tickers
CREATE TABLE IF NOT EXISTS known_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Ações', 'Cripto', 'Renda Fixa', 'FIIs')),
  logo_url TEXT,
  sector TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS but allow public read
ALTER TABLE known_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read known assets" ON known_assets FOR SELECT USING (true);

-- Create index for fast symbol lookup
CREATE INDEX IF NOT EXISTS idx_known_assets_symbol ON known_assets(symbol);
CREATE INDEX IF NOT EXISTS idx_known_assets_type ON known_assets(type);

-- ============= POPULATE BRAZILIAN STOCKS (B3) =============
INSERT INTO known_assets (symbol, name, type, sector) VALUES
-- Petróleo & Gás
('PETR3', 'Petrobras ON', 'Ações', 'Petróleo'),
('PETR4', 'Petrobras PN', 'Ações', 'Petróleo'),
('PRIO3', 'PetroRio', 'Ações', 'Petróleo'),
('RRRP3', '3R Petroleum', 'Ações', 'Petróleo'),
('RECV3', 'PetroReconcavo', 'Ações', 'Petróleo'),
-- Mineração & Siderurgia
('VALE3', 'Vale', 'Ações', 'Mineração'),
('GGBR4', 'Gerdau', 'Ações', 'Siderurgia'),
('CSNA3', 'CSN', 'Ações', 'Siderurgia'),
('USIM5', 'Usiminas', 'Ações', 'Siderurgia'),
('BRAP4', 'Bradespar', 'Ações', 'Mineração'),
-- Bancos
('ITUB4', 'Itaú Unibanco', 'Ações', 'Bancos'),
('BBDC4', 'Bradesco', 'Ações', 'Bancos'),
('BBAS3', 'Banco do Brasil', 'Ações', 'Bancos'),
('SANB11', 'Santander', 'Ações', 'Bancos'),
('BPAC11', 'BTG Pactual', 'Ações', 'Bancos'),
('ITSA4', 'Itaúsa', 'Ações', 'Holdings'),
-- Energia Elétrica
('ELET3', 'Eletrobras ON', 'Ações', 'Energia'),
('ELET6', 'Eletrobras PNB', 'Ações', 'Energia'),
('CMIG4', 'Cemig', 'Ações', 'Energia'),
('CPLE6', 'Copel', 'Ações', 'Energia'),
('ENBR3', 'Energias Brasil', 'Ações', 'Energia'),
('ENEV3', 'Eneva', 'Ações', 'Energia'),
('EQTL3', 'Equatorial', 'Ações', 'Energia'),
('TAEE11', 'Taesa', 'Ações', 'Energia'),
('TRPL4', 'Transmissão Paulista', 'Ações', 'Energia'),
-- Bebidas & Alimentos
('ABEV3', 'Ambev', 'Ações', 'Bebidas'),
('JBSS3', 'JBS', 'Ações', 'Alimentos'),
('MRFG3', 'Marfrig', 'Ações', 'Alimentos'),
('BRFS3', 'BRF', 'Ações', 'Alimentos'),
('BEEF3', 'Minerva Foods', 'Ações', 'Alimentos'),
-- Varejo
('MGLU3', 'Magazine Luiza', 'Ações', 'Varejo'),
('LREN3', 'Lojas Renner', 'Ações', 'Varejo'),
('PCAR3', 'GPA', 'Ações', 'Varejo'),
('AMER3', 'Americanas', 'Ações', 'Varejo'),
('VIIA3', 'Via Varejo', 'Ações', 'Varejo'),
('ARZZ3', 'Arezzo', 'Ações', 'Varejo'),
('SOMA3', 'Grupo Soma', 'Ações', 'Varejo'),
-- Saúde
('HAPV3', 'Hapvida', 'Ações', 'Saúde'),
('RDOR3', 'Rede D''Or', 'Ações', 'Saúde'),
('FLRY3', 'Fleury', 'Ações', 'Saúde'),
('QUAL3', 'Qualicorp', 'Ações', 'Saúde'),
('RADL3', 'Raia Drogasil', 'Ações', 'Saúde'),
('HYPE3', 'Hypera', 'Ações', 'Saúde'),
-- Imobiliário
('MRVE3', 'MRV', 'Ações', 'Imobiliário'),
('CYRE3', 'Cyrela', 'Ações', 'Imobiliário'),
('EZTC3', 'EzTec', 'Ações', 'Imobiliário'),
('EVEN3', 'Even', 'Ações', 'Imobiliário'),
('DIRR3', 'Direcional', 'Ações', 'Imobiliário'),
-- Indústria
('WEGE3', 'WEG', 'Ações', 'Indústria'),
('EMBR3', 'Embraer', 'Ações', 'Indústria'),
('SUZB3', 'Suzano', 'Ações', 'Papel e Celulose'),
('KLBN11', 'Klabin', 'Ações', 'Papel e Celulose'),
('RENT3', 'Localiza', 'Ações', 'Aluguel de Carros'),
('MOVI3', 'Movida', 'Ações', 'Aluguel de Carros'),
-- Tecnologia
('TOTS3', 'Totvs', 'Ações', 'Tecnologia'),
('LWSA3', 'Locaweb', 'Ações', 'Tecnologia'),
('POSI3', 'Positivo', 'Ações', 'Tecnologia'),
('INTB3', 'Intelbras', 'Ações', 'Tecnologia'),
('CASH3', 'Méliuz', 'Ações', 'Tecnologia'),
-- Telecom
('VIVT3', 'Vivo', 'Ações', 'Telecom'),
('TIMS3', 'TIM', 'Ações', 'Telecom'),
('OIBR3', 'Oi', 'Ações', 'Telecom'),
-- Agronegócio
('SLCE3', 'SLC Agrícola', 'Ações', 'Agro'),
('AGRO3', 'BrasilAgro', 'Ações', 'Agro'),
('SMTO3', 'São Martinho', 'Ações', 'Agro'),
('RAIZ4', 'Raízen', 'Ações', 'Agro/Energia'),
-- Transportes
('GOLL4', 'Gol', 'Ações', 'Aviação'),
('AZUL4', 'Azul', 'Ações', 'Aviação'),
('CCRO3', 'CCR', 'Ações', 'Concessões'),
('ECOR3', 'Ecorodovias', 'Ações', 'Concessões'),
('RAIL3', 'Rumo', 'Ações', 'Logística'),
-- Outros
('B3SA3', 'B3', 'Ações', 'Bolsa'),
('CIEL3', 'Cielo', 'Ações', 'Pagamentos'),
('SBSP3', 'Sabesp', 'Ações', 'Saneamento'),
('SAPR11', 'Sanepar', 'Ações', 'Saneamento'),
('CSAN3', 'Cosan', 'Ações', 'Holdings'),
('UGPA3', 'Ultrapar', 'Ações', 'Combustíveis'),
('VBBR3', 'Vibra Energia', 'Ações', 'Combustíveis'),
('MULT3', 'Multiplan', 'Ações', 'Shopping'),
('IGTI11', 'Iguatemi', 'Ações', 'Shopping'),
('NTCO3', 'Natura', 'Ações', 'Cosméticos'),
('CVCB3', 'CVC', 'Ações', 'Turismo')
ON CONFLICT (symbol) DO NOTHING;

-- ============= POPULATE INTERNATIONAL STOCKS (US) =============
INSERT INTO known_assets (symbol, name, type, sector) VALUES
-- Big Tech (FAANG+)
('AAPL', 'Apple', 'Ações', 'Tecnologia'),
('MSFT', 'Microsoft', 'Ações', 'Tecnologia'),
('GOOGL', 'Alphabet (Google)', 'Ações', 'Tecnologia'),
('GOOG', 'Alphabet Class C', 'Ações', 'Tecnologia'),
('AMZN', 'Amazon', 'Ações', 'E-commerce'),
('META', 'Meta (Facebook)', 'Ações', 'Tecnologia'),
('NVDA', 'NVIDIA', 'Ações', 'Semicondutores'),
('TSLA', 'Tesla', 'Ações', 'Automotivo'),
('NFLX', 'Netflix', 'Ações', 'Streaming'),
-- Semicondutores
('AMD', 'AMD', 'Ações', 'Semicondutores'),
('INTC', 'Intel', 'Ações', 'Semicondutores'),
('TSM', 'Taiwan Semiconductor', 'Ações', 'Semicondutores'),
('AVGO', 'Broadcom', 'Ações', 'Semicondutores'),
('QCOM', 'Qualcomm', 'Ações', 'Semicondutores'),
-- Financeiro
('JPM', 'JPMorgan Chase', 'Ações', 'Bancos'),
('BAC', 'Bank of America', 'Ações', 'Bancos'),
('WFC', 'Wells Fargo', 'Ações', 'Bancos'),
('GS', 'Goldman Sachs', 'Ações', 'Bancos'),
('V', 'Visa', 'Ações', 'Pagamentos'),
('MA', 'Mastercard', 'Ações', 'Pagamentos'),
('PYPL', 'PayPal', 'Ações', 'Pagamentos'),
-- Saúde
('JNJ', 'Johnson & Johnson', 'Ações', 'Saúde'),
('UNH', 'UnitedHealth', 'Ações', 'Saúde'),
('PFE', 'Pfizer', 'Ações', 'Farmacêutica'),
('MRNA', 'Moderna', 'Ações', 'Farmacêutica'),
('ABBV', 'AbbVie', 'Ações', 'Farmacêutica'),
-- Consumo
('KO', 'Coca-Cola', 'Ações', 'Bebidas'),
('PEP', 'PepsiCo', 'Ações', 'Bebidas'),
('MCD', 'McDonald''s', 'Ações', 'Alimentação'),
('SBUX', 'Starbucks', 'Ações', 'Alimentação'),
('NKE', 'Nike', 'Ações', 'Vestuário'),
('DIS', 'Disney', 'Ações', 'Entretenimento'),
-- Energia
('XOM', 'Exxon Mobil', 'Ações', 'Petróleo'),
('CVX', 'Chevron', 'Ações', 'Petróleo'),
-- Outros
('WMT', 'Walmart', 'Ações', 'Varejo'),
('COST', 'Costco', 'Ações', 'Varejo'),
('HD', 'Home Depot', 'Ações', 'Varejo'),
('BA', 'Boeing', 'Ações', 'Aeroespacial'),
('CRM', 'Salesforce', 'Ações', 'Software'),
('ORCL', 'Oracle', 'Ações', 'Software'),
('ADBE', 'Adobe', 'Ações', 'Software'),
('UBER', 'Uber', 'Ações', 'Mobilidade'),
('ABNB', 'Airbnb', 'Ações', 'Turismo'),
('SQ', 'Block (Square)', 'Ações', 'Fintech'),
('COIN', 'Coinbase', 'Ações', 'Cripto/Fintech'),
('PLTR', 'Palantir', 'Ações', 'Software'),
('SNOW', 'Snowflake', 'Ações', 'Cloud'),
('SHOP', 'Shopify', 'Ações', 'E-commerce')
ON CONFLICT (symbol) DO NOTHING;

-- ============= POPULATE BDRs (Brazilian Depositary Receipts) =============
INSERT INTO known_assets (symbol, name, type, sector) VALUES
('AAPL34', 'Apple BDR', 'Ações', 'Tecnologia'),
('MSFT34', 'Microsoft BDR', 'Ações', 'Tecnologia'),
('GOGL34', 'Alphabet BDR', 'Ações', 'Tecnologia'),
('AMZO34', 'Amazon BDR', 'Ações', 'E-commerce'),
('FBOK34', 'Meta BDR', 'Ações', 'Tecnologia'),
('NVDC34', 'NVIDIA BDR', 'Ações', 'Semicondutores'),
('TSLA34', 'Tesla BDR', 'Ações', 'Automotivo'),
('NFLX34', 'Netflix BDR', 'Ações', 'Streaming'),
('JPMC34', 'JPMorgan BDR', 'Ações', 'Bancos'),
('VISA34', 'Visa BDR', 'Ações', 'Pagamentos'),
('MSCD34', 'Mastercard BDR', 'Ações', 'Pagamentos'),
('COCA34', 'Coca-Cola BDR', 'Ações', 'Bebidas'),
('MCDC34', 'McDonald''s BDR', 'Ações', 'Alimentação'),
('DISB34', 'Disney BDR', 'Ações', 'Entretenimento'),
('BERK34', 'Berkshire Hathaway BDR', 'Ações', 'Holdings')
ON CONFLICT (symbol) DO NOTHING;

-- ============= POPULATE EUROPEAN STOCKS =============
INSERT INTO known_assets (symbol, name, type, sector) VALUES
-- Holanda
('ASML', 'ASML Holding', 'Ações', 'Semicondutores'),
-- Alemanha
('SAP', 'SAP SE', 'Ações', 'Software'),
('SIE', 'Siemens', 'Ações', 'Indústria'),
('BMW', 'BMW', 'Ações', 'Automotivo'),
('VOW3', 'Volkswagen', 'Ações', 'Automotivo'),
('ADS', 'Adidas', 'Ações', 'Vestuário'),
('BAS', 'BASF', 'Ações', 'Química'),
('ALV', 'Allianz', 'Ações', 'Seguros'),
('DTE', 'Deutsche Telekom', 'Ações', 'Telecom'),
-- Suíça
('NESN', 'Nestlé', 'Ações', 'Alimentos'),
('ROG', 'Roche', 'Ações', 'Farmacêutica'),
('NOVN', 'Novartis', 'Ações', 'Farmacêutica'),
('UBS', 'UBS Group', 'Ações', 'Bancos'),
-- França
('OR', 'L''Oréal', 'Ações', 'Cosméticos'),
('MC', 'LVMH', 'Ações', 'Luxo'),
('TTE', 'TotalEnergies', 'Ações', 'Energia'),
('SAN', 'Sanofi', 'Ações', 'Farmacêutica'),
('AIR', 'Airbus', 'Ações', 'Aeroespacial'),
-- Reino Unido
('SHEL', 'Shell', 'Ações', 'Petróleo'),
('BP', 'British Petroleum', 'Ações', 'Petróleo'),
('AZN', 'AstraZeneca', 'Ações', 'Farmacêutica'),
('HSBC', 'HSBC Holdings', 'Ações', 'Bancos'),
('GSK', 'GSK (GlaxoSmithKline)', 'Ações', 'Farmacêutica'),
('RIO', 'Rio Tinto', 'Ações', 'Mineração'),
('ULVR', 'Unilever', 'Ações', 'Consumo'),
-- Espanha
('SAN', 'Santander', 'Ações', 'Bancos'),
('ITX', 'Inditex (Zara)', 'Ações', 'Varejo'),
-- Suécia
('SPOT', 'Spotify', 'Ações', 'Streaming'),
-- Irlanda
('ACN', 'Accenture', 'Ações', 'Consultoria')
ON CONFLICT (symbol) DO NOTHING;

-- ============= POPULATE ASIAN STOCKS =============
INSERT INTO known_assets (symbol, name, type, sector) VALUES
-- Japão
('SONY', 'Sony', 'Ações', 'Eletrônicos'),
('TM', 'Toyota', 'Ações', 'Automotivo'),
('HMC', 'Honda', 'Ações', 'Automotivo'),
('NTDOY', 'Nintendo', 'Ações', 'Games'),
('MUFG', 'Mitsubishi UFJ', 'Ações', 'Bancos'),
('NTT', 'Nippon Telegraph', 'Ações', 'Telecom'),
-- Coreia do Sul
('005930.KS', 'Samsung Electronics', 'Ações', 'Eletrônicos'),
('HYMTF', 'Hyundai Motor', 'Ações', 'Automotivo'),
-- China
('BABA', 'Alibaba', 'Ações', 'E-commerce'),
('JD', 'JD.com', 'Ações', 'E-commerce'),
('PDD', 'Pinduoduo', 'Ações', 'E-commerce'),
('BIDU', 'Baidu', 'Ações', 'Tecnologia'),
('NIO', 'NIO', 'Ações', 'Automotivo'),
('XPEV', 'XPeng', 'Ações', 'Automotivo'),
('LI', 'Li Auto', 'Ações', 'Automotivo'),
('TCEHY', 'Tencent', 'Ações', 'Tecnologia'),
-- Hong Kong
('9988.HK', 'Alibaba HK', 'Ações', 'E-commerce'),
('0700.HK', 'Tencent HK', 'Ações', 'Tecnologia'),
-- Taiwan
('2330.TW', 'TSMC Taiwan', 'Ações', 'Semicondutores'),
-- Índia
('INFY', 'Infosys', 'Ações', 'Tecnologia'),
('WIT', 'Wipro', 'Ações', 'Tecnologia'),
('HDB', 'HDFC Bank', 'Ações', 'Bancos'),
('IBN', 'ICICI Bank', 'Ações', 'Bancos'),
('TTM', 'Tata Motors', 'Ações', 'Automotivo'),
-- Singapura
('GRAB', 'Grab Holdings', 'Ações', 'Mobilidade'),
('SEA', 'Sea Limited', 'Ações', 'Tecnologia')
ON CONFLICT (symbol) DO NOTHING;

-- ============= POPULATE AFRICAN STOCKS =============
INSERT INTO known_assets (symbol, name, type, sector) VALUES
-- África do Sul
('NPN', 'Naspers', 'Ações', 'Tecnologia'),
('MTN', 'MTN Group', 'Ações', 'Telecom'),
('SOL', 'Sasol', 'Ações', 'Energia'),
('SBK', 'Standard Bank', 'Ações', 'Bancos'),
('FSR', 'FirstRand', 'Ações', 'Bancos'),
('AGL', 'Anglo American', 'Ações', 'Mineração'),
('BHP', 'BHP Group', 'Ações', 'Mineração'),
('AMS', 'Anglo American Platinum', 'Ações', 'Mineração'),
('GFI', 'Gold Fields', 'Ações', 'Mineração'),
('ANG', 'AngloGold Ashanti', 'Ações', 'Mineração'),
-- Nigéria
('DANGCEM', 'Dangote Cement', 'Ações', 'Materiais'),
('GTCO', 'GTBank', 'Ações', 'Bancos'),
-- Egito
('HRHO', 'Hermes Holding', 'Ações', 'Holdings'),
-- Marrocos
('ATW', 'Attijariwafa Bank', 'Ações', 'Bancos')
ON CONFLICT (symbol) DO NOTHING;

-- ============= POPULATE FIIs =============
INSERT INTO known_assets (symbol, name, type, sector) VALUES
('XPML11', 'XP Malls', 'FIIs', 'Shopping'),
('HGLG11', 'CSHG Logística', 'FIIs', 'Logística'),
('KNRI11', 'Kinea Renda Imobiliária', 'FIIs', 'Híbrido'),
('MXRF11', 'Maxi Renda', 'FIIs', 'Papel'),
('XPLG11', 'XP Log', 'FIIs', 'Logística'),
('HGBS11', 'Hedge Brasil Shopping', 'FIIs', 'Shopping'),
('VISC11', 'Vinci Shopping Centers', 'FIIs', 'Shopping'),
('HGRE11', 'CSHG Renda Escritórios', 'FIIs', 'Lajes'),
('BCFF11', 'BTG Fundo de Fundos', 'FIIs', 'FOF'),
('GGRC11', 'GGR Covepi Renda', 'FIIs', 'Logística'),
('BTLG11', 'BTG Logística', 'FIIs', 'Logística'),
('VILG11', 'Vinci Logística', 'FIIs', 'Logística'),
('VRTA11', 'Fator Verita', 'FIIs', 'Papel'),
('RECT11', 'REC Renda Imobiliária', 'FIIs', 'Lajes'),
('HSML11', 'HSI Malls', 'FIIs', 'Shopping'),
('HFOF11', 'Hedge FOF', 'FIIs', 'FOF'),
('CPTS11', 'Capitânia Securities', 'FIIs', 'Papel'),
('IRDM11', 'Iridium Recebíveis', 'FIIs', 'Papel'),
('KNCR11', 'Kinea Crédito Imobiliário', 'FIIs', 'Papel'),
('RBRF11', 'RBR Alpha FOF', 'FIIs', 'FOF')
ON CONFLICT (symbol) DO NOTHING;

-- ============= POPULATE CRYPTOCURRENCIES =============
INSERT INTO known_assets (symbol, name, type) VALUES
('BTC', 'Bitcoin', 'Cripto'),
('ETH', 'Ethereum', 'Cripto'),
('BNB', 'Binance Coin', 'Cripto'),
('SOL', 'Solana', 'Cripto'),
('XRP', 'Ripple', 'Cripto'),
('ADA', 'Cardano', 'Cripto'),
('DOGE', 'Dogecoin', 'Cripto'),
('DOT', 'Polkadot', 'Cripto'),
('MATIC', 'Polygon', 'Cripto'),
('LTC', 'Litecoin', 'Cripto'),
('LINK', 'Chainlink', 'Cripto'),
('UNI', 'Uniswap', 'Cripto'),
('AVAX', 'Avalanche', 'Cripto'),
('ATOM', 'Cosmos', 'Cripto'),
('XLM', 'Stellar', 'Cripto'),
('ALGO', 'Algorand', 'Cripto'),
('NEAR', 'NEAR Protocol', 'Cripto'),
('FTM', 'Fantom', 'Cripto'),
('VET', 'VeChain', 'Cripto'),
('SHIB', 'Shiba Inu', 'Cripto'),
('TRX', 'Tron', 'Cripto'),
('APE', 'ApeCoin', 'Cripto'),
('APT', 'Aptos', 'Cripto'),
('ARB', 'Arbitrum', 'Cripto'),
('OP', 'Optimism', 'Cripto'),
('SAND', 'The Sandbox', 'Cripto'),
('MANA', 'Decentraland', 'Cripto'),
('AXS', 'Axie Infinity', 'Cripto'),
('CHZ', 'Chiliz', 'Cripto'),
('PEPE', 'Pepe', 'Cripto'),
('EOS', 'EOS', 'Cripto'),
('XMR', 'Monero', 'Cripto'),
('NEO', 'NEO', 'Cripto'),
('ETC', 'Ethereum Classic', 'Cripto'),
('FIL', 'Filecoin', 'Cripto'),
('THETA', 'Theta Network', 'Cripto'),
('XTZ', 'Tezos', 'Cripto'),
('AAVE', 'Aave', 'Cripto'),
('MKR', 'Maker', 'Cripto'),
('COMP', 'Compound', 'Cripto'),
('SNX', 'Synthetix', 'Cripto'),
('CRV', 'Curve', 'Cripto'),
('SUSHI', 'SushiSwap', 'Cripto'),
('YFI', 'yearn.finance', 'Cripto'),
('1INCH', '1inch', 'Cripto'),
('BAT', 'Basic Attention Token', 'Cripto'),
('ENJ', 'Enjin Coin', 'Cripto'),
('GRT', 'The Graph', 'Cripto'),
('IMX', 'Immutable X', 'Cripto'),
('SUI', 'Sui', 'Cripto'),
('SEI', 'Sei', 'Cripto'),
('INJ', 'Injective', 'Cripto'),
('USDT', 'Tether', 'Cripto'),
('USDC', 'USD Coin', 'Cripto'),
('BUSD', 'Binance USD', 'Cripto'),
('DAI', 'Dai', 'Cripto')
ON CONFLICT (symbol) DO NOTHING;

-- ============= UPDATE INVESTMENTS TABLE =============
-- Add 'Outros' to allowed types
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_type_check;
ALTER TABLE investments ADD CONSTRAINT investments_type_check CHECK (type IN ('Ações', 'Cripto', 'Renda Fixa', 'FIIs', 'Outros'));
