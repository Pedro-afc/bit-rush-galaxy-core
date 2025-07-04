
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

  const initializeUserData = async (userId: string) => {
    try {
      // Check if user stats exist, if not create them
      const { data: existingStats } = await supabase
        .from('stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!existingStats) {
        // Create initial stats for new user
        const { error: statsError } = await supabase
          .from('stats')
          .insert({
            user_id: userId,
            level: 1,
            xp: 0,
            energy: 100,
            max_energy: 100,
            coins: 0,
            mining_rate: 1,
            ton_balance: 1000.0,
            spins: 3,
            stars: 0
          });

        if (statsError) {
          console.error('Error creating user stats:', statsError);
          return;
        }

        // Create initial floating cards
        const floatingCardsData = [];
        
        // Explorer Stash cards
        for (let pos = 1; pos <= 9; pos++) {
          floatingCardsData.push({
            user_id: userId,
            card_name: 'explorer_stash',
            position: pos,
            is_unlocked: pos <= 3,
            is_claimed: false,
            reward_type: pos === 4 ? 'spins' : 'coins',
            reward_amount: pos <= 3 ? 1000 * pos : (pos === 4 ? 2 : 2000 * pos),
            price_ton: pos === 4 ? 2.0 : null
          });
        }

        // Crypto Cavern cards
        for (let pos = 1; pos <= 9; pos++) {
          floatingCardsData.push({
            user_id: userId,
            card_name: 'crypto_cavern',
            position: pos,
            is_unlocked: pos <= 3,
            is_claimed: false,
            reward_type: pos === 4 ? 'spins' : 'coins',
            reward_amount: pos <= 3 ? 2000 * pos : (pos === 4 ? 3 : 5000 * pos),
            price_ton: pos === 4 ? 3.0 : null
          });
        }

        await supabase.from('floating_cards').insert(floatingCardsData);

        // Create daily rewards
        const dailyRewardsData = [];
        for (let day = 1; day <= 7; day++) {
          dailyRewardsData.push({
            user_id: userId,
            day: day,
            reward_type: day === 7 ? 'spins' : 'coins',
            reward_amount: day === 7 ? 5 : 1000 * day,
            is_claimed: false
          });
        }

        await supabase.from('daily_rewards').insert(dailyRewardsData);

        // Create initial daily missions
        const missionsData = [
          {
            user_id: userId,
            mission_name: 'Haz 50 clics',
            mission_type: 'taps',
            target_value: 50,
            current_value: 0,
            reward_type: 'spins',
            reward_amount: 1,
            is_completed: false,
            is_claimed: false
          },
          {
            user_id: userId,
            mission_name: 'Mejora 3 cartas',
            mission_type: 'upgrades',
            target_value: 3,
            current_value: 0,
            reward_type: 'spins',
            reward_amount: 1,
            is_completed: false,
            is_claimed: false
          }
        ];

        await supabase.from('daily_missions').insert(missionsData);

        // Create achievements
        const achievementsData = [
          {
            user_id: userId,
            achievement_name: 'Primer Nivel',
            achievement_description: 'Alcanza el nivel 5',
            target_value: 5,
            current_value: 0,
            reward_type: 'spins',
            reward_amount: 2,
            is_completed: false,
            is_claimed: false
          },
          {
            user_id: userId,
            achievement_name: 'Millonario',
            achievement_description: 'Acumula 100,000 monedas',
            target_value: 100000,
            current_value: 0,
            reward_type: 'spins',
            reward_amount: 5,
            is_completed: false,
            is_claimed: false
          }
        ];

        await supabase.from('achievements').insert(achievementsData);

        // Create rewards wheel entry
        await supabase.from('rewards_wheel').insert({
          user_id: userId,
          spins_used: 0,
          total_rewards_claimed: 0
        });
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  };

  const loadGameData = async () => {
    if (!user) return;

    try {
      // Initialize user data if needed
      await initializeUserData(user.id);

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
        supabase.from('floating_cards').select('*').eq('user_id', user.id).order('card_name, position'),
        supabase.from('daily_rewards').select('*').eq('user_id', user.id).order('day'),
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
