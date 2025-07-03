
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Star, Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Card {
  name: string;
  level: number;
  miningBonus: number;
  priceCoins?: number;
  priceTon?: number;
  priceStars?: number;
  description: string;
}

interface CardCategoryProps {
  title: string;
  cards: Card[];
  gameState: any;
  type: string;
}

const CardCategory: React.FC<CardCategoryProps> = ({ title, cards, gameState, type }) => {
  const { toast } = useToast();

  const upgradeCard = async (card: Card) => {
    const { stats } = gameState;
    
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
      // Calculate XP gain (10% of purchase price)
      const xpGain = card.priceCoins ? Math.floor(card.priceCoins * 0.1) : Math.floor(card.priceTon * 1000 * 0.1);
      
      // Update stats
      const updates: any = {
        mining_rate: stats.mining_rate + card.miningBonus,
        xp: stats.xp + xpGain,
        updated_at: new Date().toISOString()
      };

      if (card.priceCoins) {
        updates.coins = stats.coins - card.priceCoins;
      }
      if (card.priceTon) {
        updates.ton_balance = stats.ton_balance - card.priceTon;
      }

      await supabase
        .from('stats')
        .update(updates)
        .eq('user_id', gameState.user.id);

      // Create/update card with timer
      const unlockTime = new Date();
      unlockTime.setHours(unlockTime.getHours() + 1); // 1 hour timer

      const existingCard = gameState.cards.find((c: any) => c.card_name === card.name);
      
      if (existingCard) {
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
        description: `${card.name} ha sido mejorada. +${xpGain} XP`,
      });

      // Update local state
      Object.assign(gameState.stats, updates);

    } catch (error) {
      console.error('Error upgrading card:', error);
      toast({
        title: "Error",
        description: "No se pudo mejorar la carta",
        variant: "destructive"
      });
    }
  };

  const isCardOnTimer = (cardName: string) => {
    const existingCard = gameState.cards.find((c: any) => c.card_name === cardName);
    if (!existingCard?.unlock_timer) return false;
    
    return new Date() < new Date(existingCard.unlock_timer);
  };

  const getCardLevel = (cardName: string) => {
    const existingCard = gameState.cards.find((c: any) => c.card_name === cardName);
    return existingCard?.level || 0;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
      
      <div className="space-y-3">
        {cards.map((card, index) => {
          const cardLevel = getCardLevel(card.name);
          const onTimer = isCardOnTimer(card.name);
          
          return (
            <Card key={index} className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center justify-between">
                  <span>{card.name}</span>
                  {cardLevel > 0 && (
                    <span className="text-sm text-cyan-400">Nivel {cardLevel}</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-400 text-sm">{card.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-purple-400">+{card.miningBonus} minería/h</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {card.priceCoins && (
                      <div className="flex items-center gap-1 text-green-400">
                        <Coins className="h-4 w-4" />
                        <span className="text-sm">{card.priceCoins.toLocaleString()}</span>
                      </div>
                    )}
                    {card.priceTon && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <span className="text-sm font-bold">TON</span>
                        <span className="text-sm">{card.priceTon}</span>
                      </div>
                    )}
                    {card.priceStars && (
                      <div className="flex items-center gap-1 text-pink-400">
                        <Star className="h-4 w-4" />
                        <span className="text-sm">{card.priceStars}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={() => upgradeCard(card)}
                  disabled={onTimer}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50"
                >
                  {onTimer ? (
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      <span>En progreso...</span>
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
