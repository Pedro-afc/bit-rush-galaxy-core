
-- Create a function to initialize game data for new users
CREATE OR REPLACE FUNCTION public.initialize_game_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create initial stats for new user
  INSERT INTO public.stats (
    user_id,
    level,
    xp,
    energy,
    max_energy,
    coins,
    mining_rate,
    ton_balance,
    spins,
    stars
  ) VALUES (
    NEW.id,
    1,
    0,
    100,
    100,
    0,
    1,
    1000.0,
    3,
    0
  );

  -- Create initial floating cards for Explorer Stash
  INSERT INTO public.floating_cards (user_id, card_name, position, is_unlocked, is_claimed, reward_type, reward_amount, price_ton)
  SELECT 
    NEW.id,
    'explorer_stash',
    pos,
    CASE WHEN pos <= 3 THEN true ELSE false END,
    false,
    CASE WHEN pos = 4 THEN 'spins' ELSE 'coins' END,
    CASE WHEN pos <= 3 THEN 1000 * pos 
         WHEN pos = 4 THEN 2 
         ELSE 2000 * pos END,
    CASE WHEN pos = 4 THEN 2.0 ELSE NULL END
  FROM generate_series(1, 9) AS pos;

  -- Create initial floating cards for Crypto Cavern
  INSERT INTO public.floating_cards (user_id, card_name, position, is_unlocked, is_claimed, reward_type, reward_amount, price_ton)
  SELECT 
    NEW.id,
    'crypto_cavern',
    pos,
    CASE WHEN pos <= 3 THEN true ELSE false END,
    false,
    CASE WHEN pos = 4 THEN 'spins' ELSE 'coins' END,
    CASE WHEN pos <= 3 THEN 2000 * pos 
         WHEN pos = 4 THEN 3 
         ELSE 5000 * pos END,
    CASE WHEN pos = 4 THEN 3.0 ELSE NULL END
  FROM generate_series(1, 9) AS pos;

  -- Create daily rewards
  INSERT INTO public.daily_rewards (user_id, day, reward_type, reward_amount, is_claimed)
  SELECT 
    NEW.id,
    day_num,
    CASE WHEN day_num = 7 THEN 'spins' ELSE 'coins' END,
    CASE WHEN day_num = 7 THEN 5 ELSE 1000 * day_num END,
    false
  FROM generate_series(1, 7) AS day_num;

  -- Create initial daily missions
  INSERT INTO public.daily_missions (
    user_id,
    mission_name,
    mission_type,
    target_value,
    current_value,
    reward_type,
    reward_amount,
    is_completed,
    is_claimed
  ) VALUES 
  (NEW.id, 'Haz 50 clics', 'taps', 50, 0, 'spins', 1, false, false),
  (NEW.id, 'Mejora 3 cartas', 'upgrades', 3, 0, 'spins', 1, false, false);

  -- Create achievements
  INSERT INTO public.achievements (
    user_id,
    achievement_name,
    achievement_description,
    target_value,
    current_value,
    reward_type,
    reward_amount,
    is_completed,
    is_claimed
  ) VALUES 
  (NEW.id, 'Primer Nivel', 'Alcanza el nivel 5', 5, 0, 'spins', 2, false, false),
  (NEW.id, 'Millonario', 'Acumula 100,000 monedas', 100000, 0, 'spins', 5, false, false);

  -- Create rewards wheel entry
  INSERT INTO public.rewards_wheel (user_id, spins_used, total_rewards_claimed)
  VALUES (NEW.id, 0, 0);

  RETURN NEW;
END;
$$;

-- Create trigger to initialize game data when a user is created
DROP TRIGGER IF EXISTS on_auth_user_created_game_data ON auth.users;
CREATE TRIGGER on_auth_user_created_game_data
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_game_data();

-- Grant necessary permissions for RLS policies to work
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floating_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_wheel ENABLE ROW LEVEL SECURITY;

-- Add INSERT policies for stats table
CREATE POLICY "Users can insert their own stats" ON public.stats
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add INSERT policies for floating_cards table
CREATE POLICY "Users can insert their own floating cards" ON public.floating_cards
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add INSERT policies for daily_rewards table
CREATE POLICY "Users can insert their own daily rewards" ON public.daily_rewards
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add INSERT policies for daily_missions table
CREATE POLICY "Users can insert their own daily missions" ON public.daily_missions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add INSERT policies for achievements table
CREATE POLICY "Users can insert their own achievements" ON public.achievements
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add INSERT policies for rewards_wheel table
CREATE POLICY "Users can insert their own rewards wheel" ON public.rewards_wheel
FOR INSERT WITH CHECK (auth.uid() = user_id);
