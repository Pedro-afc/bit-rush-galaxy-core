
-- Fix missing rewards for Explorer Stash cards and ensure proper unlock logic
UPDATE floating_cards 
SET 
  reward_type = 'coins',
  reward_amount = 3000
WHERE card_name = 'explorer_stash' 
  AND position = 3 
  AND (reward_type IS NULL OR reward_amount IS NULL);

-- Ensure cards 5-9 are locked until card 4 is purchased for Explorer Stash
UPDATE floating_cards 
SET is_unlocked = false
WHERE card_name = 'explorer_stash' 
  AND position >= 5
  AND user_id IN (SELECT id FROM users WHERE telegram_id = 'demo_user');

-- Ensure cards 5-9 are locked until card 4 is purchased for Crypto Cavern
UPDATE floating_cards 
SET is_unlocked = false
WHERE card_name = 'crypto_cavern' 
  AND position >= 5
  AND user_id IN (SELECT id FROM users WHERE telegram_id = 'demo_user');

-- Verify all cards have proper rewards
UPDATE floating_cards 
SET 
  reward_type = CASE 
    WHEN position = 4 THEN 'spins'
    ELSE 'coins'
  END,
  reward_amount = CASE 
    WHEN card_name = 'explorer_stash' AND position <= 3 THEN 1000 * position
    WHEN card_name = 'explorer_stash' AND position = 4 THEN 2
    WHEN card_name = 'explorer_stash' AND position > 4 THEN 2000 * position
    WHEN card_name = 'crypto_cavern' AND position <= 3 THEN 2000 * position
    WHEN card_name = 'crypto_cavern' AND position = 4 THEN 3
    WHEN card_name = 'crypto_cavern' AND position > 4 THEN 5000 * position
    ELSE reward_amount
  END
WHERE (reward_type IS NULL OR reward_amount IS NULL OR reward_amount = 0)
  AND user_id IN (SELECT id FROM users WHERE telegram_id = 'demo_user');
