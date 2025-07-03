
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, Lock, Coins, Star, Zap } from 'lucide-react';

interface FloatingCardProps {
  name: string;
  title: string;
  floatingCards: any[];
  userId: string;
}

const FloatingCard: React.FC<FloatingCardProps> = ({ name, title, floatingCards, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const cardData = floatingCards.filter(card => card.card_name === name);
  const totalCards = name === 'skins' ? 1 : 8; // Skins only has 1 card
  const claimedCount = cardData.filter(card => card.is_claimed).length;
  const allClaimed = claimedCount === totalCards;

  const getCardIcon = () => {
    switch (name) {
      case 'explorer_stash': return '🗺️';
      case 'crypto_cavern': return '💎';
      case 'skins': return '🎨';
      default: return '📦';
    }
  };

  const getCardColor = () => {
    switch (name) {
      case 'explorer_stash': return 'border-blue-500/50 bg-blue-900/20';
      case 'crypto_cavern': return 'border-purple-500/50 bg-purple-900/20';
      case 'skins': return 'border-pink-500/50 bg-pink-900/20';
      default: return 'border-gray-500/50 bg-gray-900/20';
    }
  };

  const renderGridCards = () => {
    if (name === 'skins') {
      return (
        <div className="p-4">
          <Card className="bg-pink-900/30 border-pink-500/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="text-sm font-bold text-pink-400">Premium Skins</h3>
              <p className="text-xs text-gray-400 mt-1">Colección exclusiva</p>
              <Button 
                size="sm" 
                className="mt-2 bg-pink-600 hover:bg-pink-500"
                onClick={() => setIsOpen(false)}
              >
                Ver Skins
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    const grid = [];
    for (let i = 1; i <= 9; i++) {
      const card = cardData.find(c => c.position === i);
      const isUnlocked = card?.is_unlocked || false;
      const isClaimed = card?.is_claimed || false;
      const isFree = i <= 3;
      const isTonCard = i === 4;

      grid.push(
        <Card 
          key={i}
          className={`relative ${isUnlocked ? 'bg-green-900/30 border-green-500/50' : 'bg-gray-900/30 border-gray-700/50'}`}
        >
          <CardContent className="p-3 text-center">
            {isClaimed ? (
              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
            ) : !isUnlocked ? (
              <Lock className="h-6 w-6 text-gray-500 mx-auto mb-2" />
            ) : (
              <div className="text-lg mb-2">{getCardIcon()}</div>
            )}
            
            <div className="text-xs">
              {isFree && !isClaimed && isUnlocked && (
                <div className="space-y-1">
                  <div className="text-green-400 font-bold">GRATIS</div>
                  <Button size="sm" className="w-full text-xs h-6">
                    Reclamar
                  </Button>
                </div>
              )}
              
              {isTonCard && !isClaimed && !isUnlocked && (
                <div className="space-y-1">
                  <div className="text-yellow-400 font-bold">2 TON</div>
                  <Button size="sm" className="w-full text-xs h-6">
                    Comprar
                  </Button>
                </div>
              )}
              
              {i > 4 && !isUnlocked && (
                <div className="text-gray-500 text-xs">Bloqueado</div>
              )}
              
              {isClaimed && (
                <div className="text-green-400 text-xs">Reclamado</div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-2 p-4">
        {grid}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className={`cursor-pointer hover:scale-105 transition-transform ${getCardColor()}`}>
          <CardContent className="p-4 text-center">
            {allClaimed ? (
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
            ) : (
              <div className="text-2xl mb-2">{getCardIcon()}</div>
            )}
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {name === 'skins' ? 'Exclusivo' : `${claimedCount}/${totalCards}`}
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="bg-gray-900 border-gray-700 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <span className="text-xl">{getCardIcon()}</span>
            {title}
          </DialogTitle>
        </DialogHeader>
        {renderGridCards()}
      </DialogContent>
    </Dialog>
  );
};

export default FloatingCard;
