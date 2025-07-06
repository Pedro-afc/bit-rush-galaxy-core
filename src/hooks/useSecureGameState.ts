
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

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

export const useSecureGameState = () => {
  const { user, isAuthenticated } = useAuth();
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

  const loadGameData = async () => {
    if (!user) return;

    try {
      console.log('Loading game data for user:', user.email);
      
      // Load all game data (the database trigger should have initialized everything)
      const [
        { data: stats },
        { data: cards },
        { data: floatingCards },
        { data: dailyRewards },
        { data: dailyMissions },
        { data: achievements },
        { data: shopItems },
        { data: rewardsWheel }
      ] = await Promise.all([
        supabase.from('stats').select('*').eq('user_id', user.id).single(),
        supabase.from('cards').select('*').eq('user_id', user.id),
        supabase.from('floating_cards').select('*').eq('user_id', user.id).order('card_name, position'),
        supabase.from('daily_rewards').select('*').eq('user_id', user.id).order('day'),
        supabase.from('daily_missions').select('*').eq('user_id', user.id),
        supabase.from('achievements').select('*').eq('user_id', user.id),
        supabase.from('shop_items').select('*').eq('user_id', user.id),
        supabase.from('rewards_wheel').select('*').eq('user_id', user.id).single()
      ]);

      console.log('Game data loaded:', { stats, floatingCards: floatingCards?.length, dailyRewards: dailyRewards?.length });

      setGameState({
        user,
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

  useEffect(() => {
    if (isAuthenticated && user) {
      loadGameData();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const updateStats = async (updates: Partial<any>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('stats')
        .update(updates)
        .eq('user_id', user.id)
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

  const refreshGameState = () => {
    if (user) {
      loadGameData();
    }
  };

  return {
    gameState,
    loading,
    updateStats,
    refreshGameState,
    isAuthenticated
  };
};
