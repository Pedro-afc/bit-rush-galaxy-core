
-- Phase 1: Remove overly permissive policies and implement proper RLS

-- Drop all existing overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;
DROP POLICY IF EXISTS "Allow all operations on stats" ON public.stats;
DROP POLICY IF EXISTS "Allow all operations on cards" ON public.cards;
DROP POLICY IF EXISTS "Allow all operations on floating_cards" ON public.floating_cards;
DROP POLICY IF EXISTS "Allow all operations on daily_rewards" ON public.daily_rewards;
DROP POLICY IF EXISTS "Allow all operations on daily_missions" ON public.daily_missions;
DROP POLICY IF EXISTS "Allow all operations on achievements" ON public.achievements;
DROP POLICY IF EXISTS "Allow all operations on rewards_wheel" ON public.rewards_wheel;
DROP POLICY IF EXISTS "Allow all operations on shop_items" ON public.shop_items;
DROP POLICY IF EXISTS "Allow all operations on referrals" ON public.referrals;

-- Create proper user-specific RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = telegram_id OR auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = telegram_id OR auth.uid() = id);

-- Create proper user-specific RLS policies for stats table
CREATE POLICY "Users can view their own stats" ON public.stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Create proper user-specific RLS policies for cards table
CREATE POLICY "Users can view their own cards" ON public.cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cards" ON public.cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards" ON public.cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards" ON public.cards
  FOR DELETE USING (auth.uid() = user_id);

-- Create proper user-specific RLS policies for floating_cards table
CREATE POLICY "Users can view their own floating cards" ON public.floating_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own floating cards" ON public.floating_cards
  FOR UPDATE USING (auth.uid() = user_id);

-- Create proper user-specific RLS policies for daily_rewards table
CREATE POLICY "Users can view their own daily rewards" ON public.daily_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily rewards" ON public.daily_rewards
  FOR UPDATE USING (auth.uid() = user_id);

-- Create proper user-specific RLS policies for daily_missions table
CREATE POLICY "Users can view their own daily missions" ON public.daily_missions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily missions" ON public.daily_missions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create proper user-specific RLS policies for achievements table
CREATE POLICY "Users can view their own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" ON public.achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- Create proper user-specific RLS policies for rewards_wheel table
CREATE POLICY "Users can view their own rewards wheel" ON public.rewards_wheel
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards wheel" ON public.rewards_wheel
  FOR UPDATE USING (auth.uid() = user_id);

-- Create proper user-specific RLS policies for shop_items table
CREATE POLICY "Users can view their own shop items" ON public.shop_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own shop items" ON public.shop_items
  FOR UPDATE USING (auth.uid() = user_id);

-- Create proper user-specific RLS policies for referrals table
CREATE POLICY "Users can view referrals they made" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view referrals they received" ON public.referrals
  FOR SELECT USING (auth.uid() = referred_id);

CREATE POLICY "Users can insert referrals they make" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Add database constraints for game balance limits
ALTER TABLE stats ADD CONSTRAINT coins_positive CHECK (coins >= 0);
ALTER TABLE stats ADD CONSTRAINT energy_bounds CHECK (energy >= 0 AND energy <= max_energy);
ALTER TABLE stats ADD CONSTRAINT max_energy_positive CHECK (max_energy > 0);
ALTER TABLE stats ADD CONSTRAINT mining_rate_positive CHECK (mining_rate > 0);
ALTER TABLE stats ADD CONSTRAINT ton_balance_positive CHECK (ton_balance >= 0);
ALTER TABLE stats ADD CONSTRAINT spins_positive CHECK (spins >= 0);
ALTER TABLE stats ADD CONSTRAINT stars_positive CHECK (stars >= 0);

-- Add constraints for floating cards
ALTER TABLE floating_cards ADD CONSTRAINT position_bounds CHECK (position >= 1 AND position <= 9);
ALTER TABLE floating_cards ADD CONSTRAINT reward_amount_positive CHECK (reward_amount IS NULL OR reward_amount > 0);

-- Create user profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_id TEXT UNIQUE,
  username TEXT,
  referral_code TEXT UNIQUE DEFAULT SUBSTRING(MD5(RANDOM()::TEXT), 1, 8),
  referred_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, telegram_id, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'telegram_id',
    NEW.raw_user_meta_data ->> 'username'
  );
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
