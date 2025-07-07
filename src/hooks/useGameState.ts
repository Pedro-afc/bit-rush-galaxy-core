import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    user: null,
    stats: null,
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
      // Get user data from public.users table
      let { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!userData) {
        // Create user record if it doesn't exist
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            telegram_id: user.user_metadata?.telegram_id || user.email,
            username: user.user_metadata?.username || `User_${user.id.slice(-8)}`
          })
          .select()
          .single();

        if (userError) {
          console.error('Error creating user:', userError);
          return;
        }

        userData = newUser;
      }

      // Check if stats exist for the user
      let { data: stats } = await supabase
        .from('stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!stats) {
        // Create initial stats if they don't exist
        const { data: newStats, error: statsError } = await supabase
          .from('stats')
          .insert({
            user_id: user.id,
            level: 1,
            xp: 0,
            energy: 100,
            max_energy: 100,
            coins: 0,
            mining_rate: 1,
            ton_balance: 1000.0,
            spins: 3,
            stars: 0
          })
          .select()
          .single();

        if (statsError) {
          console.error('Error creating stats:', statsError);
          return;
        }

        stats = newStats;
      }

      // Load all game data
      const [
        { data: cards },
        { data: floatingCards },
        { data: dailyRewards },
        { data: dailyMissions },
        { data: achievements },
        { data: shopItems },
        { data: rewardsWheel }
      ] = await Promise.all([
        supabase.from('cards').select('*').eq('user_id', user.id),
        supabase.from('floating_cards').select('*').eq('user_id', user.id).order('card_name, position'),
        supabase.from('daily_rewards').select('*').eq('user_id', user.id).order('day'),
        supabase.from('daily_missions').select('*').eq('user_id', user.id),
        supabase.from('achievements').select('*').eq('user_id', user.id),
        supabase.from('shop_items').select('*').eq('user_id', user.id),
        supabase.from('rewards_wheel').select('*').eq('user_id', user.id).single()
      ]);

      setGameState({
        user: userData,
        stats,
        cards: cards || [],
        floatingCards: floatingCards || [],
        dailyRewards: dailyRewards || [],
        dailyMissions: dailyMissions || [],
        achievements: achievements || [],
        shopItems: shopItems || [],
        rewardsWheel
      });
    } catch (error) {
      console.error('Error loading game data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el juego",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (updates: Partial<any>) => {
    try {
      const { data, error } = await supabase
        .from('stats')
        .update(updates)
        .eq('user_id', gameState.user.id)
        .select()
        .single();

      if (error) throw error;

      setGameState(prev => ({
        ...prev,
        stats: data
      }));
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
      await supabase
        .from('daily_missions')
        .update({
          current_value: newValue,
          is_completed: isCompleted
        })
        .eq('id', mission.id);

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
      await supabase
        .from('achievements')
        .update({
          current_value: newValue,
          is_completed: isCompleted
        })
        .eq('id', achievement.id);

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

  const refreshFloatingCards = async () => {
    try {
      const { data: floatingCards } = await supabase
        .from('floating_cards')
        .select('*')
        .eq('user_id', gameState.user.id)
        .order('card_name, position');

      setGameState(prev => ({
        ...prev,
        floatingCards: floatingCards || []
      }));
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
    refreshGameState: loadGameData,
    refreshFloatingCards
  };
};
