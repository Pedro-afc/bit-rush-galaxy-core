
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, Lock, Coins, Star, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FloatingCardProps {
  name: string;
  title: string;
  floatingCards: any[];
  userId: string;
}

const FloatingCard: React.FC<FloatingCardProps> = ({ name, title, floatingCards, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [claiming, setClaiming] = useState<number | null>(null);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const { toast } = useToast();
  
  const cardData = floatingCards.filter(card => card.card_name === name);
  const totalCards = name === 'skins' ? 1 : 9;
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

  const handleClaimCard = async (position: number, card: any) => {
    if (!card.is_unlocked || card.is_claimed || claiming) return;
    
    setClaiming(position);
    
    try {
      // Mark card as claimed
      await supabase
        .from('floating_cards')
        .update({ 
          is_claimed: true,
          purchase_date: new Date().toISOString()
        })
        .eq('id', card.id);

      // Add reward to player stats
      const updates: any = {};
      if (card.reward_type === 'coins') {
        // Get current stats first
        const { data: currentStats } = await supabase
          .from('stats')
          .select('coins, spins')
          .eq('user_id', userId)
          .single();
        
        updates.coins = (currentStats?.coins || 0) + card.reward_amount;
      } else if (card.reward_type === 'spins') {
        const { data: currentStats } = await supabase
          .from('stats')
          .select('coins, spins')
          .eq('user_id', userId)
          .single();
        
        updates.spins = (currentStats?.spins || 0) + card.reward_amount;
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('stats')
          .update(updates)
          .eq('user_id', userId);
      }

      toast({
        title: "¡Recompensa reclamada!",
        description: `+${card.reward_amount} ${card.reward_type === 'coins' ? 'monedas' : 'giros'}`,
      });

      // Check if position 4 was claimed to unlock remaining cards
      if (position === 4) {
        await unlockRemainingCards();
      }

      // Refresh page to update state
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error claiming card:', error);
      toast({
        title: "Error",
        description: "No se pudo reclamar la carta",
        variant: "destructive"
      });
    } finally {
      setClaiming(null);
    }
  };

  const handlePurchaseCard = async (position: number, card: any) => {
    if (purchasing || !card.price_ton) return;
    
    setPurchasing(position);
    
    try {
      // For demo purposes, we'll simulate the TON purchase
      toast({
        title: "Compra simulada",
        description: `Se simula la compra de ${card.price_ton} TON`,
      });

      // Mark card as purchased and claimed
      await supabase
        .from('floating_cards')
        .update({ 
          is_unlocked: true,
          is_claimed: true,
          purchase_date: new Date().toISOString()
        })
        .eq('id', card.id);

      // Add reward
      const { data: currentStats } = await supabase
        .from('stats')
        .select('coins, spins')
        .eq('user_id', userId)
        .single();

      const updates: any = {};
      if (card.reward_type === 'spins') {
        updates.spins = (currentStats?.spins || 0) + card.reward_amount;
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('stats')
          .update(updates)
          .eq('user_id', userId);
      }

      // Unlock remaining cards
      await unlockRemainingCards();

      toast({
        title: "¡Compra exitosa!",
        description: `+${card.reward_amount} giros de ruleta`,
      });

      // Refresh page
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error purchasing card:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la compra",
        variant: "destructive"
      });
    } finally {
      setPurchasing(null);
    }
  };

  const unlockRemainingCards = async () => {
    try {
      await supabase
        .from('floating_cards')
        .update({ is_unlocked: true })
        .eq('card_name', name)
        .eq('user_id', userId)
        .gte('position', 5);
    } catch (error) {
      console.error('Error unlocking remaining cards:', error);
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
                Próximamente
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
      const isLocked = i > 4 && !isUnlocked;

      grid.push(
        <Card 
          key={i}
          className={`relative ${
            isClaimed ? 'bg-green-900/30 border-green-500/50' : 
            isUnlocked ? 'bg-cyan-900/30 border-cyan-500/50' : 
            'bg-gray-900/30 border-gray-700/50'
          }`}
        >
          <CardContent className="p-3 text-center">
            {isClaimed ? (
              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
            ) : !isUnlocked ? (
              <Lock className="h-6 w-6 text-gray-500 mx-auto mb-2" />
            ) : (
              <div className="text-lg mb-2">{getCardIcon()}</div>
            )}
            
            <div className="text-xs space-y-1">
              {card && (
                <div className="text-xs font-bold text-white">
                  +{card.reward_amount} {card.reward_type === 'coins' ? '💰' : '⚡'}
                </div>
              )}
              
              {isFree && !isClaimed && isUnlocked && (
                <div className="space-y-1">
                  <div className="text-green-400 font-bold">GRATIS</div>
                  <Button 
                    size="sm" 
                    className="w-full text-xs h-6"
                    onClick={() => handleClaimCard(i, card)}
                    disabled={claiming === i}
                  >
                    {claiming === i ? 'Reclamando...' : 'Reclamar'}
                  </Button>
                </div>
              )}
              
              {isTonCard && !isClaimed && (
                <div className="space-y-1">
                  <div className="text-yellow-400 font-bold">{card?.price_ton} TON</div>
                  <Button 
                    size="sm" 
                    className="w-full text-xs h-6 bg-yellow-600 hover:bg-yellow-500"
                    onClick={() => handlePurchaseCard(i, card)}
                    disabled={purchasing === i}
                  >
                    {purchasing === i ? 'Comprando...' : 'Comprar'}
                  </Button>
                </div>
              )}
              
              {isLocked && (
                <div className="text-gray-500 text-xs">Bloqueado</div>
              )}
              
              {isClaimed && (
                <div className="text-green-400 text-xs">✓ Reclamado</div>
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
              {name === 'skins' ? 'Exclusivo' : `${claimedCount}/9`}
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
