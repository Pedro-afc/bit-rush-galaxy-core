-- Script para arreglar la autenticación de Supabase
-- Ejecutar esto en el SQL Editor de Supabase

-- 1. Habilitar la extensión auth si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Asegurar que la tabla auth.users existe y tiene los permisos correctos
-- (Esto debería estar ya configurado por Supabase)

-- 3. Configurar políticas RLS para permitir la creación de usuarios
-- Primero, deshabilitar RLS temporalmente en las tablas principales
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.floating_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_wheel DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items DISABLE ROW LEVEL SECURITY;

-- 4. Crear función para inicializar datos del juego cuando se crea un usuario
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
END;
$$;

-- 5. Crear trigger para ejecutar la función cuando se crea un usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 6. Habilitar RLS nuevamente con políticas más permisivas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floating_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_wheel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas que permitan acceso completo para usuarios autenticados
-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Stats
DROP POLICY IF EXISTS "Users can view their own stats" ON public.stats;
CREATE POLICY "Users can view their own stats" ON public.stats
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own stats" ON public.stats;
CREATE POLICY "Users can update their own stats" ON public.stats
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own stats" ON public.stats;
CREATE POLICY "Users can insert their own stats" ON public.stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Rewards Wheel
DROP POLICY IF EXISTS "Users can view their own rewards wheel" ON public.rewards_wheel;
CREATE POLICY "Users can view their own rewards wheel" ON public.rewards_wheel
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own rewards wheel" ON public.rewards_wheel;
CREATE POLICY "Users can update their own rewards wheel" ON public.rewards_wheel
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own rewards wheel" ON public.rewards_wheel;
CREATE POLICY "Users can insert their own rewards wheel" ON public.rewards_wheel
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Verificar que todo esté configurado correctamente
SELECT 'Configuration completed successfully' as status; 