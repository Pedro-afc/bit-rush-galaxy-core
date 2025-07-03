
-- Create users table
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id TEXT UNIQUE,
  username TEXT,
  referral_code TEXT UNIQUE DEFAULT SUBSTRING(MD5(RANDOM()::TEXT), 1, 8),
  referred_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user stats table
CREATE TABLE public.stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  level INTEGER DEFAULT 1,
  xp BIGINT DEFAULT 0,
  energy INTEGER DEFAULT 100,
  max_energy INTEGER DEFAULT 100,
  coins BIGINT DEFAULT 0,
  mining_rate BIGINT DEFAULT 1,
  ton_balance DECIMAL(10,4) DEFAULT 1000.0,
  spins INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  last_energy_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cards table
CREATE TABLE public.cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  card_type TEXT NOT NULL, -- 'mining', 'elite', etc.
  card_name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  mining_bonus BIGINT DEFAULT 0,
  price_coins BIGINT,
  price_ton DECIMAL(8,4),
  price_stars INTEGER,
  unlock_timer TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create floating cards table
CREATE TABLE public.floating_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  card_name TEXT NOT NULL, -- 'explorer_stash', 'crypto_cavern', 'skins'
  position INTEGER NOT NULL, -- 1-9 for grid positions
  is_claimed BOOLEAN DEFAULT FALSE,
  is_unlocked BOOLEAN DEFAULT FALSE,
  reward_type TEXT, -- 'coins', 'spins', 'stars'
  reward_amount INTEGER,
  price_ton DECIMAL(8,4),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily rewards table
CREATE TABLE public.daily_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  day INTEGER NOT NULL, -- 1-7
  is_claimed BOOLEAN DEFAULT FALSE,
  last_claim_date DATE,
  reward_type TEXT,
  reward_amount INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily missions table
CREATE TABLE public.daily_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mission_type TEXT NOT NULL,
  mission_name TEXT NOT NULL,
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  is_claimed BOOLEAN DEFAULT FALSE,
  unlock_timer TIMESTAMP WITH TIME ZONE,
  reward_type TEXT,
  reward_amount INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  is_claimed BOOLEAN DEFAULT FALSE,
  unlock_timer TIMESTAMP WITH TIME ZONE,
  reward_type TEXT,
  reward_amount INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rewards wheel table
CREATE TABLE public.rewards_wheel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  spins_used INTEGER DEFAULT 0,
  last_spin TIMESTAMP WITH TIME ZONE,
  total_rewards_claimed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shop items table
CREATE TABLE public.shop_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL, -- 'coins', 'booster', 'skin'
  base_price_stars INTEGER,
  base_price_ton DECIMAL(8,4),
  current_price_stars INTEGER,
  current_price_ton DECIMAL(8,4),
  purchase_count INTEGER DEFAULT 0,
  unlock_timer TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  reward_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floating_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_wheel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing public access for now - you'll need auth later)
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stats" ON public.stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on cards" ON public.cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on floating_cards" ON public.floating_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on daily_rewards" ON public.daily_rewards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on daily_missions" ON public.daily_missions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on achievements" ON public.achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on rewards_wheel" ON public.rewards_wheel FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on shop_items" ON public.shop_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on referrals" ON public.referrals FOR ALL USING (true) WITH CHECK (true);

-- Insert some initial data
INSERT INTO public.users (telegram_id, username) VALUES ('demo_user', 'DemoPlayer');

-- Get the demo user ID for initial data
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM public.users WHERE telegram_id = 'demo_user';
    
    -- Insert initial stats
    INSERT INTO public.stats (user_id) VALUES (demo_user_id);
    
    -- Insert initial floating cards setup
    INSERT INTO public.floating_cards (user_id, card_name, position, is_unlocked) VALUES
    (demo_user_id, 'explorer_stash', 1, true),
    (demo_user_id, 'explorer_stash', 2, true),
    (demo_user_id, 'explorer_stash', 3, true),
    (demo_user_id, 'explorer_stash', 4, false),
    (demo_user_id, 'crypto_cavern', 1, true),
    (demo_user_id, 'crypto_cavern', 2, true),
    (demo_user_id, 'crypto_cavern', 3, true),
    (demo_user_id, 'crypto_cavern', 4, false);
    
    -- Insert daily rewards
    FOR i IN 1..7 LOOP
        INSERT INTO public.daily_rewards (user_id, day, reward_type, reward_amount) VALUES
        (demo_user_id, i, 'coins', 1000 * i);
    END LOOP;
    
    -- Insert initial daily missions
    INSERT INTO public.daily_missions (user_id, mission_type, mission_name, target_value, reward_type, reward_amount) VALUES
    (demo_user_id, 'tap', 'Tap 100 times', 100, 'spins', 2),
    (demo_user_id, 'mining', 'Collect 10000 coins from mining', 10000, 'stars', 5),
    (demo_user_id, 'upgrade', 'Upgrade 3 cards', 3, 'coins', 5000);
    
    -- Insert initial achievements
    INSERT INTO public.achievements (user_id, achievement_name, achievement_description, target_value, reward_type, reward_amount) VALUES
    (demo_user_id, 'First Steps', 'Reach level 5', 5, 'spins', 5),
    (demo_user_id, 'Coin Master', 'Collect 100,000 coins', 100000, 'stars', 10),
    (demo_user_id, 'Card Collector', 'Own 20 cards', 20, 'ton', 1);
    
    -- Insert initial shop items
    INSERT INTO public.shop_items (user_id, item_name, item_type, base_price_stars, current_price_stars) VALUES
    (demo_user_id, '1000 Coins', 'coins', 50, 50),
    (demo_user_id, 'Energy Booster', 'booster', 100, 100);
    
    INSERT INTO public.shop_items (user_id, item_name, item_type, base_price_ton, current_price_ton) VALUES
    (demo_user_id, 'Premium Pack', 'pack', 3.0, 3.0);
    
    -- Initialize rewards wheel
    INSERT INTO public.rewards_wheel (user_id) VALUES (demo_user_id);
END $$;
