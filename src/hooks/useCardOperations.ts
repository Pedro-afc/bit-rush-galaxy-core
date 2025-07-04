
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Card {
  name: string;
  level: number;
  miningBonus: number;
  priceCoins?: number;
  priceTon?: number;
  description: string;
  icon: string;
}

export const useCardOperations = (gameState: any, refreshGameState: () => void) => {
  const { toast } = useToast();
  const [timers, setTimers] = useState<{[key: string]: number}>({});

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newTimers: {[key: string]: number} = {};
      
      gameState.cards.forEach((card: any) => {
        if (card.unlock_timer) {
          const unlockTime = new Date(card.unlock_timer).getTime();
          const timeLeft = Math.max(0, unlockTime - now);
          if (timeLeft > 0) {
            newTimers[card.card_name] = timeLeft;
          }
        }
      });
      
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.cards]);

  const upgradeCard = async (card: Card, type: string) => {
    const { stats } = gameState;
    
    // Check if user has enough resources
    if (card.priceCoins && stats.coins < card.priceCoins) {
      toast({
        title: "Fondos insuficientes",
        description: "No tienes suficientes monedas",
        variant: "destructive"
      });
      return;
    }

    if (card.priceTon && stats.ton_balance < card.priceTon) {
      toast({
        title: "Fondos insuficientes",
        description: "No tienes suficiente TON",
        variant: "destructive"
      });
      return;
    }

    try {
      // Calculate XP gain (15% of purchase price)
      const xpGain = card.priceCoins 
        ? Math.floor(card.priceCoins * 0.15) 
        : Math.floor((card.priceTon || 0) * 10000 * 0.15);
      
      // Calculate new level based on XP
      const newXP = stats.xp + xpGain;
      let newLevel = stats.level;
      let requiredXP = 100000; // First level requirement
      
      while (newXP >= requiredXP && newLevel < 50) {
        newLevel++;
        requiredXP += 50000 + (newLevel * 25000); // Progressive XP requirement
      }

      // Update user stats
      const statsUpdates: any = {
        mining_rate: stats.mining_rate + card.miningBonus,
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString()
      };

      if (card.priceCoins) {
        statsUpdates.coins = stats.coins - card.priceCoins;
      }
      if (card.priceTon) {
        statsUpdates.ton_balance = parseFloat((stats.ton_balance - card.priceTon).toFixed(4));
      }

      await supabase
        .from('stats')
        .update(statsUpdates)
        .eq('user_id', gameState.user.id);

      // Create/update card with timer (3 hours cooldown)
      const unlockTime = new Date();
      unlockTime.setHours(unlockTime.getHours() + 3);

      const existingCard = gameState.cards.find((c: any) => c.card_name === card.name);
      
      if (existingCard) {
        // Update existing card
        await supabase
          .from('cards')
          .update({
            level: existingCard.level + 1,
            mining_bonus: existingCard.mining_bonus + card.miningBonus,
            unlock_timer: unlockTime.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCard.id);
      } else {
        // Create new card
        await supabase
          .from('cards')
          .insert({
            user_id: gameState.user.id,
            card_type: type,
            card_name: card.name,
            level: 1,
            mining_bonus: card.miningBonus,
            price_coins: card.priceCoins,
            price_ton: card.priceTon,
            unlock_timer: unlockTime.toISOString()
          });
      }

      toast({
        title: "¡Carta mejorada!",
        description: `${card.name} mejorada. +${xpGain} XP${newLevel > stats.level ? ` ¡Nivel ${newLevel}!` : ''}`,
      });

      // Refresh game state instead of reloading the page
      refreshGameState();

    } catch (error) {
      console.error('Error upgrading card:', error);
      toast({
        title: "Error",
        description: "No se pudo mejorar la carta",
        variant: "destructive"
      });
    }
  };

  const skipTimer = async (cardName: string) => {
    const { stats } = gameState;
    const starsRequired = 10; // Cost to skip timer
    
    if (stats.stars < starsRequired) {
      toast({
        title: "Estrellas insuficientes",
        description: `Necesitas ${starsRequired} estrellas para saltar el tiempo`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Update stats - subtract stars
      await supabase
        .from('stats')
        .update({ 
          stars: stats.stars - starsRequired,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', gameState.user.id);

      // Remove timer from card
      const existingCard = gameState.cards.find((c: any) => c.card_name === cardName);
      if (existingCard) {
        await supabase
          .from('cards')
          .update({
            unlock_timer: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCard.id);
      }

      toast({
        title: "¡Timer saltado!",
        description: `Usado ${starsRequired} estrellas para saltar el tiempo`,
      });

      // Refresh game state
      refreshGameState();

    } catch (error) {
      console.error('Error skipping timer:', error);
      toast({
        title: "Error",
        description: "No se pudo saltar el tiempo",
        variant: "destructive"
      });
    }
  };

  const getCardLevel = (cardName: string) => {
    const existingCard = gameState.cards.find((c: any) => c.card_name === cardName);
    return existingCard?.level || 0;
  };

  const getCardMiningBonus = (cardName: string) => {
    const existingCard = gameState.cards.find((c: any) => c.card_name === cardName);
    return existingCard?.mining_bonus || 0;
  };

  const isCardOnTimer = (cardName: string) => {
    return timers[cardName] > 0;
  };

  return {
    timers,
    upgradeCard,
    skipTimer,
    getCardLevel,
    getCardMiningBonus,
    isCardOnTimer
  };
};
