import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface GameState {
  user: any;
  stats: any;
  cards: any[];
  floatingCards: any[];
  dailyRewards: any[];
  dailyMissions: any[];
  achievements: any[];
  shopItems: any[];
  rewardsWheel: any;
}

// Estado inicial por defecto
const defaultStats = {
  level: 1,
  xp: 0,
  energy: 100,
  max_energy: 100,
  coins: 0,
  mining_rate: 1,
  ton_balance: 1000.0,
  spins: 3,
  stars: 0
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    user: null,
    stats: defaultStats,
    cards: [],
    floatingCards: [],
    dailyRewards: [],
    dailyMissions: [],
    achievements: [],
    shopItems: [],
    rewardsWheel: null
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const loadGameData = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Loading game data for user:', user.id);
      
      // Cargar datos reales desde la base de datos
      const [
        { data: userProfile, error: userError },
        { data: stats, error: statsError },
        { data: cards, error: cardsError },
        { data: floatingCards, error: floatingCardsError },
        { data: dailyRewards, error: dailyRewardsError },
        { data: dailyMissions, error: dailyMissionsError },
        { data: achievements, error: achievementsError },
        { data: shopItems, error: shopItemsError },
        { data: rewardsWheel, error: rewardsWheelError }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('stats').select('*').eq('user_id', user.id).single(),
        supabase.from('cards').select('*').eq('user_id', user.id),
        supabase.from('floating_cards').select('*').eq('user_id', user.id).order('card_name, position'),
        supabase.from('daily_rewards').select('*').eq('user_id', user.id).order('day'),
        supabase.from('daily_missions').select('*').eq('user_id', user.id),
        supabase.from('achievements').select('*').eq('user_id', user.id),
        supabase.from('shop_items').select('*').eq('user_id', user.id),
        supabase.from('rewards_wheel').select('*').eq('user_id', user.id).single()
      ]);

      // Manejar errores
      if (userError) console.error('Error loading user profile:', userError);
      if (statsError) console.error('Error loading stats:', statsError);
      if (cardsError) console.error('Error loading cards:', cardsError);
      if (floatingCardsError) console.error('Error loading floating cards:', floatingCardsError);
      if (dailyRewardsError) console.error('Error loading daily rewards:', dailyRewardsError);
      if (dailyMissionsError) console.error('Error loading daily missions:', dailyMissionsError);
      if (achievementsError) console.error('Error loading achievements:', achievementsError);
      if (shopItemsError) console.error('Error loading shop items:', shopItemsError);
      if (rewardsWheelError) console.error('Error loading rewards wheel:', rewardsWheelError);

      // Si no hay stats, crear stats iniciales
      let userStats = stats;
      if (!stats && !statsError) {
        console.log('Creating initial stats for user');
        const { data: newStats, error: createStatsError } = await supabase
          .from('stats')
          .insert({
            user_id: user.id,
            ...defaultStats
          })
          .select()
          .single();

        if (createStatsError) {
          console.error('Error creating initial stats:', createStatsError);
          userStats = defaultStats;
        } else {
          userStats = newStats;
        }
      }

      // Si no hay rewards wheel, crear uno inicial
      let userRewardsWheel = rewardsWheel;
      if (!rewardsWheel && !rewardsWheelError) {
        console.log('Creating initial rewards wheel for user');
        const { data: newRewardsWheel, error: createWheelError } = await supabase
          .from('rewards_wheel')
          .insert({
            user_id: user.id,
            spins_used: 0,
            total_rewards_claimed: 0
          })
          .select()
          .single();

        if (createWheelError) {
          console.error('Error creating initial rewards wheel:', createWheelError);
        } else {
          userRewardsWheel = newRewardsWheel;
        }
      }

      setGameState({
        user: userProfile || {
          id: user.id,
          telegram_id: user.address,
          username: user.username || `User_${user.address.slice(-8)}`,
          referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        },
        stats: userStats || defaultStats,
        cards: cards || [],
        floatingCards: floatingCards || [],
        dailyRewards: dailyRewards || [],
        dailyMissions: dailyMissions || [],
        achievements: achievements || [],
        shopItems: shopItems || [],
        rewardsWheel: userRewardsWheel
      });

      console.log('Game data loaded successfully:', { 
        user: userProfile?.username, 
        stats: userStats, 
        floatingCards: floatingCards?.length || 0 
      });

    } catch (error) {
      console.error('Error loading game data:', error);
      
      // En caso de error, usar datos por defecto
      setGameState({
        user: null,
        stats: defaultStats,
        cards: [],
        floatingCards: [],
        dailyRewards: [],
        dailyMissions: [],
        achievements: [],
        shopItems: [],
        rewardsWheel: null
      });

      toast({
        title: "Error",
        description: "No se pudo cargar el juego, usando datos por defecto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (updates: Partial<any>) => {
    if (!gameState.user || !user) return;
    
    try {
      // Actualizar estado local inmediatamente
      setGameState(prev => {
        const newStats = { ...prev.stats, ...updates };
        console.log('Updating game state:', { old: prev.stats, new: newStats, updates });
        return {
          ...prev,
          stats: newStats
        };
      });

      // Actualizar en la base de datos
      const { error } = await supabase
        .from('stats')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating stats in database:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar el progreso",
          variant: "destructive"
        });
      } else {
        console.log('Stats updated in database:', updates);
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const updateMissionProgress = async (missionType: string, value: number) => {
    const mission = gameState.dailyMissions.find((m: any) => m.mission_type === missionType);
    if (!mission || mission.is_completed) return;

    const newValue = Math.min(mission.target_value, mission.current_value + value);
    const isCompleted = newValue >= mission.target_value;

    try {
      // Update local state
      setGameState(prev => ({
        ...prev,
        dailyMissions: prev.dailyMissions.map((m: any) => 
          m.id === mission.id 
            ? { ...m, current_value: newValue, is_completed: isCompleted }
            : m
        )
      }));

      // Update in database
      const { error } = await supabase
        .from('daily_missions')
        .update({ 
          current_value: newValue, 
          is_completed: isCompleted 
        })
        .eq('id', mission.id);

      if (error) {
        console.error('Error updating mission progress:', error);
      }
    } catch (error) {
      console.error('Error updating mission progress:', error);
    }
  };

  const updateAchievementProgress = async (achievementName: string, value: number) => {
    const achievement = gameState.achievements.find((a: any) => a.achievement_name === achievementName);
    if (!achievement || achievement.is_completed) return;

    const newValue = Math.min(achievement.target_value, value);
    const isCompleted = newValue >= achievement.target_value;

    try {
      // Update local state
      setGameState(prev => ({
        ...prev,
        achievements: prev.achievements.map((a: any) => 
          a.id === achievement.id 
            ? { ...a, current_value: newValue, is_completed: isCompleted }
            : a
        )
      }));

      // Update in database
      const { error } = await supabase
        .from('achievements')
        .update({ 
          current_value: newValue, 
          is_completed: isCompleted 
        })
        .eq('id', achievement.id);

      if (error) {
        console.error('Error updating achievement progress:', error);
      }
    } catch (error) {
      console.error('Error updating achievement progress:', error);
    }
  };

  const refreshGameState = () => {
    loadGameData();
  };

  const refreshFloatingCards = async () => {
    if (!gameState.user) return;
    
    try {
      const { data: floatingCards, error } = await supabase
        .from('floating_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('card_name, position');

      if (error) {
        console.error('Error refreshing floating cards:', error);
      } else {
        setGameState(prev => ({
          ...prev,
          floatingCards: floatingCards || []
        }));
      }
    } catch (error) {
      console.error('Error refreshing floating cards:', error);
    }
  };

  useEffect(() => {
    loadGameData();
  }, [isAuthenticated, user]);

  return {
    gameState,
    loading,
    updateStats,
    updateMissionProgress,
    updateAchievementProgress,
    refreshGameState,
    refreshFloatingCards
  };
};
