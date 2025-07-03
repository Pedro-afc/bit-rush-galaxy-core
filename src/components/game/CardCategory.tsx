
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Timer } from 'lucide-react';
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

interface CardCategoryProps {
  title: string;
  cards: Card[];
  gameState: any;
  type: string;
  categoryColor: string;
}

const CardCategory: React.FC<CardCategoryProps> = ({ title, cards, gameState, type, categoryColor }) => {
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

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const upgradeCard = async (card: Card) => {
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

      // Update local state
      Object.assign(gameState.stats, statsUpdates);
      
      // Refresh game state
      window.location.reload();

    } catch (error) {
      console.error('Error upgrading card:', error);
      toast({
        title: "Error",
        description: "No se pudo mejorar la carta",
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

  return (
    <div className="space-y-4">
      <h2 className={`text-lg font-bold mb-4 ${categoryColor}`}>{title}</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, index) => {
          const cardLevel = getCardLevel(card.name);
          const cardMiningBonus = getCardMiningBonus(card.name);
          const onTimer = isCardOnTimer(card.name);
          const timeLeft = timers[card.name] || 0;
          
          return (
            <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{card.icon}</div>
                  {cardLevel > 0 && (
                    <span className={`text-sm px-2 py-1 rounded ${categoryColor} bg-gray-700/50`}>
                      Nv. {cardLevel}
                    </span>
                  )}
                </div>
                <CardTitle className="text-white text-sm leading-tight">
                  {card.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-400 text-xs">{card.description}</p>
                
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="text-purple-400">
                      +{card.miningBonus}/h minería
                    </span>
                    {cardMiningBonus > 0 && (
                      <span className="text-green-400 ml-2">
                        (Total: {cardMiningBonus}/h)
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    {card.priceCoins && (
                      <div className="flex items-center gap-1 text-green-400">
                        <Coins className="h-3 w-3" />
                        <span>{card.priceCoins.toLocaleString()}</span>
                      </div>
                    )}
                    {card.priceTon && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <span className="text-xs font-bold">TON</span>
                        <span>{card.priceTon}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={() => upgradeCard(card)}
                  disabled={onTimer}
                  className={`w-full text-xs h-8 ${
                    onTimer 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                  }`}
                >
                  {onTimer ? (
                    <div className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      <span>{formatTime(timeLeft)}</span>
                    </div>
                  ) : (
                    cardLevel > 0 ? 'Mejorar' : 'Comprar'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CardCategory;
