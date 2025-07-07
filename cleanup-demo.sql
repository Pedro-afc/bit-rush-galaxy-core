-- Elimina todos los datos relacionados con el usuario demo
DO $$
DECLARE
  demo_id UUID;
BEGIN
  SELECT id INTO demo_id FROM public.users WHERE telegram_id = 'demo_user';
  IF demo_id IS NOT NULL THEN
    DELETE FROM public.stats WHERE user_id = demo_id;
    DELETE FROM public.cards WHERE user_id = demo_id;
    DELETE FROM public.floating_cards WHERE user_id = demo_id;
    DELETE FROM public.daily_rewards WHERE user_id = demo_id;
    DELETE FROM public.daily_missions WHERE user_id = demo_id;
    DELETE FROM public.achievements WHERE user_id = demo_id;
    DELETE FROM public.shop_items WHERE user_id = demo_id;
    DELETE FROM public.rewards_wheel WHERE user_id = demo_id;
    DELETE FROM public.users WHERE id = demo_id;
    RAISE NOTICE 'Demo user and all related data deleted successfully';
  ELSE
    RAISE NOTICE 'Demo user not found';
  END IF;
END $$; 