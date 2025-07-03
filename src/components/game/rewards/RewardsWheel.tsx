
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Star, Zap, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RewardsWheelProps {
  gameState: any;
}

const RewardsWheel: React.FC<RewardsWheelProps> = ({ gameState }) => {
  const [spinning, setSpinning] = useState(false);
  const { toast } = useToast();

  const wheelPrizes = [
    { type: 'coins', amount: 1000, icon: Coins, color: 'text-green-400' },
    { type: 'spins', amount: 1, icon: RotateCcw, color: 'text-purple-400' },
    { type: 'coins', amount: 5000, icon: Coins, color: 'text-green-400' },
    { type: 'stars', amount: 10, icon: Star, color: 'text-pink-400' },
    { type: 'coins', amount: 2000, icon: Coins, color: 'text-green-400' },
    { type: 'energy', amount: 50, icon: Zap, color: 'text-yellow-400' },
    { type: 'coins', amount: 10000, icon: Coins, color: 'text-green-400' },
    { type: 'stars', amount: 25, icon: Star, color: 'text-pink-400' },
  ];

  const spinWheel = async () => {
    if (gameState.stats.spins <= 0) {
      toast({
        title: "Sin giros",
        description: "No tienes giros restantes",
        variant: "destructive"
      });
      return;
    }

    setSpinning(true);
    
    // Simulate spinning delay
    setTimeout(async () => {
      const randomPrize = wheelPrizes[Math.floor(Math.random() * wheelPrizes.length)];
      
      try {
        // Update stats based on prize
        const updates: any = {
          spins: gameState.stats.spins - 1,
          updated_at: new Date().toISOString()
        };

        switch (randomPrize.type) {
          case 'coins':
            updates.coins = gameState.stats.coins + randomPrize.amount;
            break;
          case 'stars':
            updates.stars = gameState.stats.stars + randomPrize.amount;
            break;
          case 'energy':
            updates.energy = Math.min(gameState.stats.max_energy, gameState.stats.energy + randomPrize.amount);
            break;
          case 'spins':
            updates.spins = gameState.stats.spins; // Don't decrease spins for this prize
            break;
        }

        await supabase
          .from('stats')
          .update(updates)
          .eq('user_id', gameState.user.id);

        // Update rewards wheel
        await supabase
          .from('rewards_wheel')
          .update({
            spins_used: gameState.rewardsWheel.spins_used + 1,
            last_spin: new Date().toISOString(),
            total_rewards_claimed: gameState.rewardsWheel.total_rewards_claimed + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', gameState.user.id);

        toast({
          title: "¡Felicidades!",
          description: `Has ganado ${randomPrize.amount} ${randomPrize.type === 'coins' ? 'monedas' : 
                       randomPrize.type === 'stars' ? 'estrellas' : 
                       randomPrize.type === 'energy' ? 'energía' : 'giros'}`,
        });

        // Update local state
        Object.assign(gameState.stats, updates);
        gameState.rewardsWheel.spins_used += 1;
        gameState.rewardsWheel.total_rewards_claimed += 1;

      } catch (error) {
        console.error('Error spinning wheel:', error);
        toast({
          title: "Error",
          description: "No se pudo girar la ruleta",
          variant: "destructive"
        });
      }
      
      setSpinning(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Ruleta de Premios</h2>
        <p className="text-gray-400 text-sm">Gira la ruleta para ganar increíbles premios</p>
      </div>

      {/* Wheel Display */}
      <div className="relative">
        <div className={`w-64 h-64 mx-auto rounded-full border-4 border-cyan-500/50 bg-gradient-to-r from-purple-900 to-blue-900 ${spinning ? 'animate-spin' : ''}`}>
          <div className="absolute inset-4 rounded-full grid grid-cols-2 gap-1">
            {wheelPrizes.slice(0, 8).map((prize, index) => {
              const Icon = prize.icon;
              return (
                <div key={index} className="flex items-center justify-center bg-gray-800/50 rounded-lg">
                  <div className="text-center">
                    <Icon className={`h-4 w-4 mx-auto mb-1 ${prize.color}`} />
                    <div className="text-xs text-white font-bold">{prize.amount}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Center pointer */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-800"></div>
        </div>
      </div>

      {/* Spin Button */}
      <div className="text-center space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
          <div className="text-purple-400 font-bold text-lg">
            Giros restantes: {gameState.stats.spins}
          </div>
        </div>

        <Button 
          onClick={spinWheel}
          disabled={spinning || gameState.stats.spins <= 0}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
        >
          {spinning ? 'Girando...' : 'Girar Ruleta'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-3 text-center">
            <div className="text-cyan-400 font-bold">Giros Usados</div>
            <div className="text-white text-lg">{gameState.rewardsWheel?.spins_used || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-3 text-center">
            <div className="text-green-400 font-bold">Premios Ganados</div>
            <div className="text-white text-lg">{gameState.rewardsWheel?.total_rewards_claimed || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RewardsWheel;
