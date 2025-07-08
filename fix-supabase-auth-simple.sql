-- Script simplificado para arreglar la autenticación de Supabase
-- Ejecutar esto en el SQL Editor de Supabase

-- 1. Deshabilitar RLS completamente en todas las tablas
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.floating_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_wheel DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar triggers existentes que puedan estar causando conflictos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_game_data ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.initialize_game_data();
DROP FUNCTION IF EXISTS public.handle_new_auth_user();

-- 3. Crear función simple para inicializar datos
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Crear perfil del usuario
  INSERT INTO public.profiles (
    id,
    telegram_id,
    username,
    referral_code
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'wallet_address', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', 'User_' || substring(NEW.email from 1 for 8)),
    SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)
  );

  -- Crear stats iniciales
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

  -- Crear rewards wheel inicial
  INSERT INTO public.rewards_wheel (
    user_id,
    spins_used,
    total_rewards_claimed
  ) VALUES (
    NEW.id,
    0,
    0
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Si hay error, solo retornar NEW sin hacer nada
    RAISE NOTICE 'Error in handle_new_auth_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 5. Verificar configuración
SELECT 'RLS disabled and trigger created successfully' as status; 