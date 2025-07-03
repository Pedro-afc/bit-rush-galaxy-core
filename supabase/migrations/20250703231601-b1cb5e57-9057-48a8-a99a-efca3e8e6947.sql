
-- Add missing columns to existing tables
ALTER TABLE floating_cards ADD COLUMN IF NOT EXISTS purchase_date timestamp with time zone;
ALTER TABLE floating_cards ADD COLUMN IF NOT EXISTS unlock_requirements jsonb DEFAULT '{}';

-- Update daily_rewards table structure
ALTER TABLE daily_rewards ADD COLUMN IF NOT EXISTS streak_count integer DEFAULT 0;
ALTER TABLE daily_rewards ADD COLUMN IF NOT EXISTS current_day integer DEFAULT 1;

-- Add spins tracking to stats table
UPDATE stats SET spins = COALESCE(spins, 3) WHERE spins IS NULL;

-- Insert sample data for floating cards (Explorer Stash)
INSERT INTO floating_cards (user_id, card_name, position, is_unlocked, is_claimed, reward_type, reward_amount, price_ton) 
SELECT 
  u.id,
  'explorer_stash',
  pos.position,
  CASE 
    WHEN pos.position <= 3 THEN true 
    ELSE false 
  END,
  false,
  CASE 
    WHEN pos.position = 4 THEN 'spins'
    ELSE 'coins'
  END,
  CASE 
    WHEN pos.position <= 3 THEN 1000 * pos.position
    WHEN pos.position = 4 THEN 2
    ELSE 2000 * pos.position
  END,
  CASE 
    WHEN pos.position = 4 THEN 2.0
    ELSE NULL
  END
FROM users u
CROSS JOIN (SELECT generate_series(1,9) as position) pos
WHERE u.telegram_id = 'demo_user'
ON CONFLICT DO NOTHING;

-- Insert sample data for floating cards (Crypto Cavern)
INSERT INTO floating_cards (user_id, card_name, position, is_unlocked, is_claimed, reward_type, reward_amount, price_ton) 
SELECT 
  u.id,
  'crypto_cavern',
  pos.position,
  CASE 
    WHEN pos.position <= 3 THEN true 
    ELSE false 
  END,
  false,
  CASE 
    WHEN pos.position = 4 THEN 'spins'
    ELSE 'coins'
  END,
  CASE 
    WHEN pos.position <= 3 THEN 2000 * pos.position
    WHEN pos.position = 4 THEN 3
    ELSE 5000 * pos.position
  END,
  CASE 
    WHEN pos.position = 4 THEN 3.0
    ELSE NULL
  END
FROM users u
CROSS JOIN (SELECT generate_series(1,9) as position) pos
WHERE u.telegram_id = 'demo_user'
ON CONFLICT DO NOTHING;

-- Insert daily login rewards for 7 days
INSERT INTO daily_rewards (user_id, day, reward_type, reward_amount, is_claimed)
SELECT 
  u.id,
  day_num,
  CASE 
    WHEN day_num = 7 THEN 'spins'
    ELSE 'coins'
  END,
  CASE 
    WHEN day_num = 7 THEN 5
    ELSE 1000 * day_num
  END,
  false
FROM users u
CROSS JOIN (SELECT generate_series(1,7) as day_num) days
WHERE u.telegram_id = 'demo_user'
ON CONFLICT DO NOTHING;

-- Insert sample daily missions
INSERT INTO daily_missions (user_id, mission_name, mission_type, target_value, current_value, reward_type, reward_amount, is_completed, is_claimed)
SELECT 
  u.id,
  mission.name,
  mission.type,
  mission.target,
  0,
  'spins',
  1,
  false,
  false
FROM users u
CROSS JOIN (
  VALUES 
    ('Haz 50 clics', 'taps', 50),
    ('Mejora 3 cartas', 'upgrades', 3),
    ('Gana 10,000 monedas', 'coins_earned', 10000),
    ('Alcanza nivel 3', 'level_reach', 3)
) AS mission(name, type, target)
WHERE u.telegram_id = 'demo_user'
ON CONFLICT DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (user_id, achievement_name, achievement_description, target_value, current_value, reward_type, reward_amount, is_completed, is_claimed)
SELECT 
  u.id,
  achievement.name,
  achievement.description,
  achievement.target,
  0,
  'spins',
  achievement.reward,
  false,
  false
FROM users u
CROSS JOIN (
  VALUES 
    ('Primer Nivel', 'Alcanza el nivel 5', 5, 2),
    ('Coleccionista', 'Desbloquea 10 cartas', 10, 3),
    ('Millonario', 'Acumula 100,000 monedas', 100000, 5),
    ('Maestro Minero', 'Alcanza 1000/h de minería', 1000, 10)
) AS achievement(name, description, target, reward)
WHERE u.telegram_id = 'demo_user'
ON CONFLICT DO NOTHING;

-- Insert rewards wheel data
INSERT INTO rewards_wheel (user_id, spins_used, total_rewards_claimed, last_spin)
SELECT u.id, 0, 0, NULL
FROM users u
WHERE u.telegram_id = 'demo_user'
ON CONFLICT DO NOTHING;
