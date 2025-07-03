
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  const loadGameData = async () => {
    try {
      // Get demo user data
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', 'demo_user')
        .single();

      if (!user) {
        console.error('Demo user not found');
        return;
      }

      // Load all game data
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
        supabase.from('floating_cards').select('*').eq('user_id', user.id),
        supabase.from('daily_rewards').select('*').eq('user_id', user.id),
        supabase.from('daily_missions').select('*').eq('user_id', user.id),
        supabase.from('achievements').select('*').eq('user_id', user.id),
        supabase.from('shop_items').select('*').eq('user_id', user.id),
        supabase.from('rewards_wheel').select('*').eq('user_id', user.id).single()
      ]);

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

  useEffect(() => {
    loadGameData();
  }, []);

  return {
    gameState,
    loading,
    updateStats,
    refreshGameState: loadGameData
  };
};
