
import React from 'react';
import { useCardOperations } from '@/hooks/useCardOperations';
import { MiningCard } from './MiningCard';

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

const CardCategory: React.FC<CardCategoryProps> = ({ 
  title, 
  cards, 
  gameState, 
  type, 
  categoryColor 
}) => {
  const {
    timers,
    upgradeCard,
    getCardLevel,
    getCardMiningBonus,
    isCardOnTimer
  } = useCardOperations(gameState);

  const handleUpgrade = (card: Card) => {
    upgradeCard(card, type);
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
            <MiningCard
              key={index}
              card={card}
              cardLevel={cardLevel}
              cardMiningBonus={cardMiningBonus}
              onTimer={onTimer}
              timeLeft={timeLeft}
              categoryColor={categoryColor}
              onUpgrade={handleUpgrade}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CardCategory;
