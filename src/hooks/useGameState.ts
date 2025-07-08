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
      
      // Verificar si hay sesión activa de Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting Supabase session:', sessionError);
      }

      if (session) {
        console.log('Supabase session active, loading from database');
        
        // Cargar datos reales desde la base de datos
        const [
          { data: stats, error: statsError },
          { data: cards, error: cardsError },
          { data: floatingCards, error: floatingCardsError },
          { data: dailyRewards, error: dailyRewardsError },
          { data: dailyMissions, error: dailyMissionsError },
          { data: achievements, error: achievementsError },
          { data: shopItems, error: shopItemsError },
          { data: rewardsWheel, error: rewardsWheelError }
        ] = await Promise.all([
          supabase.from('stats').select('*').eq('user_id', session.user.id).single(),
          supabase.from('cards').select('*').eq('user_id', session.user.id),
          supabase.from('floating_cards').select('*').eq('user_id', session.user.id).order('card_name, position'),
          supabase.from('daily_rewards').select('*').eq('user_id', session.user.id).order('day'),
          supabase.from('daily_missions').select('*').eq('user_id', session.user.id),
          supabase.from('achievements').select('*').eq('user_id', session.user.id),
          supabase.from('shop_items').select('*').eq('user_id', session.user.id),
          supabase.from('rewards_wheel').select('*').eq('user_id', session.user.id).single()
        ]);

        // Manejar errores
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
              user_id: session.user.id,
              level: defaultStats.level,
              xp: defaultStats.xp,
              energy: defaultStats.energy,
              max_energy: defaultStats.max_energy,
              coins: defaultStats.coins,
              mining_rate: defaultStats.mining_rate,
              ton_balance: defaultStats.ton_balance,
              spins: defaultStats.spins,
              stars: defaultStats.stars
            } as any)
            .select()
            .single();

          if (createStatsError) {
            console.error('Error creating initial stats:', createStatsError);
            userStats = defaultStats as any;
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
              user_id: session.user.id,
              spins_used: 0,
              total_rewards_claimed: 0
            } as any)
            .select()
            .single();

          if (createWheelError) {
            console.error('Error creating initial rewards wheel:', createWheelError);
          } else {
            userRewardsWheel = newRewardsWheel;
          }
        }

        setGameState({
          user: {
            id: session.user.id,
            telegram_id: user.address,
            username: user.username,
            referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          },
          stats: userStats || defaultStats as any,
          cards: cards || [],
          floatingCards: floatingCards || [],
          dailyRewards: dailyRewards || [],
          dailyMissions: dailyMissions || [],
          achievements: achievements || [],
          shopItems: shopItems || [],
          rewardsWheel: userRewardsWheel
        });

        console.log('Game data loaded successfully from database:', { 
          user: user.username, 
          stats: userStats, 
          floatingCards: floatingCards?.length || 0 
        });

      } else {
        // Fallback a localStorage si no hay sesión de Supabase
        console.log('No Supabase session, using localStorage fallback');
        
        const savedGameData = localStorage.getItem(`bitrush_game_${user.id}`);
        let savedStats = defaultStats;
        
        if (savedGameData) {
          try {
            const parsedData = JSON.parse(savedGameData);
            savedStats = parsedData.stats || defaultStats;
            console.log('Loaded saved game data from localStorage:', parsedData);
          } catch (error) {
            console.error('Error parsing saved game data:', error);
          }
        }

        setGameState({
          user: {
            id: user.id,
            telegram_id: user.address,
            username: user.username,
            referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          },
          stats: savedStats as any,
          cards: [],
          floatingCards: [],
          dailyRewards: [],
          dailyMissions: [],
          achievements: [],
          shopItems: [],
          rewardsWheel: { spins_used: 0, total_rewards_claimed: 0 }
        });

        console.log('Game data loaded from localStorage fallback');
      }

    } catch (error) {
      console.error('Error loading game data:', error);
      
      // En caso de error, usar datos por defecto
      setGameState({
        user: null,
        stats: defaultStats as any,
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
        
        // Guardar en localStorage como fallback
        const gameData = {
          ...prev,
          stats: newStats
        };
        localStorage.setItem(`bitrush_game_${user.id}`, JSON.stringify(gameData));
        
        return gameData;
      });

      // Verificar si hay sesión de Supabase para guardar en la base de datos
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Actualizar en la base de datos
        const { error } = await supabase
          .from('stats')
          .update(updates)
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error updating stats in database:', error);
          toast({
            title: "Error",
            description: "No se pudo guardar el progreso en la base de datos",
            variant: "destructive"
          });
        } else {
          console.log('Stats updated in database:', updates);
        }
      } else {
        console.log('No Supabase session, stats saved to localStorage only');
      }

      console.log('Stats updated and saved:', updates);
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
      setGameState(prev => {
        const updatedMissions = prev.dailyMissions.map((m: any) => 
          m.id === mission.id 
            ? { ...m, current_value: newValue, is_completed: isCompleted }
            : m
        );
        
        const newState = {
          ...prev,
          dailyMissions: updatedMissions
        };
        
        return newState;
      });

      // Verificar si hay sesión de Supabase para guardar en la base de datos
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Actualizar en la base de datos
        const { error } = await supabase
          .from('daily_missions')
          .update({ 
            current_value: newValue, 
            is_completed: isCompleted 
          })
          .eq('id', mission.id);

        if (error) {
          console.error('Error updating mission in database:', error);
        } else {
          console.log('Mission updated in database:', { missionType, newValue, isCompleted });
        }
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
      setGameState(prev => {
        const updatedAchievements = prev.achievements.map((a: any) => 
          a.id === achievement.id 
            ? { ...a, current_value: newValue, is_completed: isCompleted }
            : a
        );
        
        const newState = {
          ...prev,
          achievements: updatedAchievements
        };
        
        return newState;
      });

      // Verificar si hay sesión de Supabase para guardar en la base de datos
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Actualizar en la base de datos
        const { error } = await supabase
          .from('achievements')
          .update({ 
            current_value: newValue, 
            is_completed: isCompleted 
          })
          .eq('id', achievement.id);

        if (error) {
          console.error('Error updating achievement in database:', error);
        } else {
          console.log('Achievement updated in database:', { achievementName, newValue, isCompleted });
        }
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
      console.log('Refreshing floating cards...');
      // Por ahora, solo actualizar estado local
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
