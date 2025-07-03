
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Coins, Star, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RewardsWheelProps {
  gameState: any;
}

const RewardsWheel: React.FC<RewardsWheelProps> = ({ gameState }) => {
  const { toast } = useToast();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const availableSpins = gameState.stats?.spins || 0;

  const rewards = [
    { type: 'coins', amount: 1000, icon: Coins, color: 'text-yellow-400', label: '1K Monedas' },
    { type: 'coins', amount: 2500, icon: Coins, color: 'text-yellow-400', label: '2.5K Monedas' },
    { type: 'coins', amount: 5000, icon: Coins, color: 'text-yellow-400', label: '5K Monedas' },
    { type: 'spins', amount: 1, icon: Zap, color: 'text-purple-400', label: '+1 Giro' },
    { type: 'coins', amount: 500, icon: Coins, color: 'text-yellow-400', label: '500 Monedas' },
    { type: 'coins', amount: 7500, icon: Coins, color: 'text-yellow-400', label: '7.5K Monedas' },
    { type: 'spins', amount: 2, icon: Zap, color: 'text-purple-400', label: '+2 Giros' },
    { type: 'coins', amount: 10000, icon: Coins, color: 'text-yellow-400', label: '10K Monedas' },
  ];

  const handleSpin = async () => {
    if (availableSpins <= 0 || spinning) return;

    setSpinning(true);
    
    // Random rotation (multiple full spins + random position)
    const randomIndex = Math.floor(Math.random() * rewards.length);
    const sectionAngle = 360 / rewards.length;
    const newRotation = rotation + 360 * 5 + (randomIndex * sectionAngle) + (sectionAngle / 2);
    
    setRotation(newRotation);

    // Wait for animation
    setTimeout(async () => {
      const selectedReward = rewards[randomIndex];
      
      try {
        // Update spins and add reward
        const updates: any = {
          spins: Math.max(0, availableSpins - 1)
        };

        if (selectedReward.type === 'coins') {
          updates.coins = gameState.stats.coins + selectedReward.amount;
        } else if (selectedReward.type === 'spins') {
          updates.spins += selectedReward.amount;
        }

        await supabase
          .from('stats')
          .update(updates)
          .eq('user_id', gameState.user.id);

        // Update wheel stats
        await supabase
          .from('rewards_wheel')
          .update({
            spins_used: (gameState.rewardsWheel?.spins_used || 0) + 1,
            total_rewards_claimed: (gameState.rewardsWheel?.total_rewards_claimed || 0) + 1,
            last_spin: new Date().toISOString()
          })
          .eq('user_id', gameState.user.id);

        toast({
          title: "¡Felicidades!",
          description: `Ganaste: ${selectedReward.label}`,
        });

        // Refresh after short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (error) {
        console.error('Error spinning wheel:', error);
        toast({
          title: "Error",
          description: "No se pudo procesar el giro",
          variant: "destructive"
        });
      } finally {
        setSpinning(false);
      }
    }, 3000);
  };

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold text-white mb-4">Ruleta de Recompensas</h2>
      
      {/* Wheel */}
      <div className="relative mx-auto mb-6" style={{ width: '280px', height: '280px' }}>
        <div 
          className="absolute inset-0 rounded-full border-4 border-cyan-500 transition-transform duration-3000 ease-out"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            background: `conic-gradient(${rewards.map((_, i) => 
              `hsl(${(i * 360) / rewards.length}, 70%, 50%) ${(i * 100) / rewards.length}%, hsl(${((i + 1) * 360) / rewards.length}, 70%, 50%) ${((i + 1) * 100) / rewards.length}%`
            ).join(', ')})`
          }}
        >
          {rewards.map((reward, index) => {
            const angle = (index * 360) / rewards.length;
            const Icon = reward.icon;
            return (
              <div
                key={index}
                className="absolute text-white text-xs font-bold flex items-center justify-center"
                style={{
                  top: '50%',
                  left: '50%',
                  width: '60px',
                  height: '20px',
                  transform: `translate(-50%, -50%) rotate(${angle + 22.5}deg) translateY(-100px)`,
                  transformOrigin: 'center'
                }}
              >
                <Icon className="h-3 w-3" />
              </div>
            );
          })}
        </div>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-white z-10"></div>
      </div>

      {/* Spin Button */}
      <Card className="bg-gray-800/50 border-purple-500/50 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-purple-400" />
            <span className="text-purple-400 font-bold">Giros disponibles: {availableSpins}</span>
          </div>
          <Button
            onClick={handleSpin}
            disabled={availableSpins <= 0 || spinning}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
          >
            {spinning ? 'Girando...' : availableSpins <= 0 ? 'Sin giros' : '¡Girar Ruleta!'}
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <Card className="bg-gray-800/30 border-gray-600/50">
          <CardContent className="p-3 text-center">
            <div className="text-gray-400">Giros usados</div>
            <div className="text-white font-bold">{gameState.rewardsWheel?.spins_used || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/30 border-gray-600/50">
          <CardContent className="p-3 text-center">
            <div className="text-gray-400">Recompensas</div>
            <div className="text-white font-bold">{gameState.rewardsWheel?.total_rewards_claimed || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RewardsWheel;
