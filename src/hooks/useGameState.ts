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
    stats: defaultStats, // Usar stats por defecto
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
      // Por ahora, usar datos simulados para evitar problemas de base de datos
      const simulatedUser = {
        id: user.id,
        telegram_id: user.address,
        username: user.username || `User_${user.address.slice(-8)}`,
        referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      };

      const simulatedStats = {
        ...defaultStats,
        user_id: user.id
      };

      // Simular datos del juego
      const simulatedCards = [];
      const simulatedFloatingCards = [];
      const simulatedDailyRewards = [];
      const simulatedDailyMissions = [];
      const simulatedAchievements = [];
      const simulatedShopItems = [];
      const simulatedRewardsWheel = null;

      setGameState({
        user: simulatedUser,
        stats: simulatedStats,
        cards: simulatedCards,
        floatingCards: simulatedFloatingCards,
        dailyRewards: simulatedDailyRewards,
        dailyMissions: simulatedDailyMissions,
        achievements: simulatedAchievements,
        shopItems: simulatedShopItems,
        rewardsWheel: simulatedRewardsWheel
      });

      console.log('Game data loaded successfully with simulated data');

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
    if (!gameState.user) return;
    
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

      // TODO: Implementar actualización en base de datos cuando esté lista
      console.log('Stats updated locally:', updates);
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
      // Por ahora, solo actualizar estado local
      console.log('Refreshing floating cards...');
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
