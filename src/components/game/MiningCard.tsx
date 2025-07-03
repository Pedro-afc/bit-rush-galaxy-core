
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins } from 'lucide-react';
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
  onUpgrade: (card: CardData) => void;
}

export const MiningCard: React.FC<MiningCardProps> = ({
  card,
  cardLevel,
  cardMiningBonus,
  onTimer,
  timeLeft,
  categoryColor,
  onUpgrade
}) => {
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
        
        <Button 
          onClick={() => onUpgrade(card)}
          disabled={onTimer}
          className={`w-full text-xs h-8 ${
            onTimer 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
          }`}
        >
          {onTimer ? (
            <CardTimer timeLeft={timeLeft} />
          ) : (
            cardLevel > 0 ? 'Mejorar' : 'Comprar'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
