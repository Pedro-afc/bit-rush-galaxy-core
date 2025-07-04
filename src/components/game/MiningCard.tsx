
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Star } from 'lucide-react';
import { CardTimer } from './CardTimer';

interface CardData {
  name: string;
  level: number;
  miningBonus: number;
  priceCoins?: number;
  priceTon?: number;
  description: string;
  icon: string;
}

interface MiningCardProps {
  card: CardData;
  cardLevel: number;
  cardMiningBonus: number;
  onTimer: boolean;
  timeLeft: number;
  categoryColor: string;
  gameState: any;
  onUpgrade: (card: CardData) => void;
  onSkipTimer: (cardName: string) => void;
}

export const MiningCard: React.FC<MiningCardProps> = ({
  card,
  cardLevel,
  cardMiningBonus,
  onTimer,
  timeLeft,
  categoryColor,
  gameState,
  onUpgrade,
  onSkipTimer
}) => {
  const starsRequired = 10;
  const hasEnoughStars = gameState?.stats?.stars >= starsRequired;
  const canUpgrade = !onTimer && (
    (card.priceCoins && gameState?.stats?.coins >= card.priceCoins) ||
    (card.priceTon && gameState?.stats?.ton_balance >= card.priceTon)
  );

  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-colors">
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
        
        <div className="space-y-2">
          <Button 
            onClick={() => onUpgrade(card)}
            disabled={onTimer || !canUpgrade}
            className={`w-full text-xs h-8 transition-all duration-200 ${
              onTimer 
                ? 'bg-gray-600 cursor-not-allowed' 
                : canUpgrade
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            {onTimer ? (
              <CardTimer timeLeft={timeLeft} />
            ) : (
              cardLevel > 0 ? 'Mejorar' : 'Comprar'
            )}
          </Button>
          
          {onTimer && (
            <Button
              onClick={() => onSkipTimer(card.name)}
              disabled={!hasEnoughStars}
              className={`w-full text-xs h-8 transition-all duration-200 ${
                hasEnoughStars
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              <Star className="h-3 w-3 mr-1" />
              Saltar ({starsRequired} ⭐)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
