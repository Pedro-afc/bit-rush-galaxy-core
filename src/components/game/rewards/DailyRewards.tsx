import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Lock, Coins, Zap, Star, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface DailyRewardsProps {
  gameState: any;
}

const DailyRewards: React.FC<DailyRewardsProps> = ({ gameState }) => {
  const { toast } = useToast();
  const [claiming, setClaiming] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const dailyRewards = gameState.dailyRewards || [];
  const currentDay = Math.min(7, Math.max(1, (gameState.stats?.level || 1) % 7 || 1));
  const availableSpins = gameState.stats?.spins || 0;

  const rewards = [
    { type: 'coins', amount: 1000, icon: Coins, color: 'text-yellow-400', label: '1K Monedas' },
    { type: 'spins', amount: 2, icon: Zap, color: 'text-purple-400', label: '+2 Giros' },
    { type: 'coins', amount: 5000, icon: Coins, color: 'text-yellow-400', label: '5K Monedas' },
    { type: 'spins', amount: 3, icon: Zap, color: 'text-purple-400', label: '+3 Giros' },
    { type: 'coins', amount: 2500, icon: Coins, color: 'text-yellow-400', label: '2.5K Monedas' },
    { type: 'spins', amount: 4, icon: Zap, color: 'text-purple-400', label: '+4 Giros' },
    { type: 'spins', amount: 5, icon: Zap, color: 'text-purple-400', label: '+5 Giros' },
    { type: 'coins', amount: 10000, icon: Coins, color: 'text-yellow-400', label: '10K Monedas' },
  ];

  const formatAmount = (amount: number, type: string) => {
    if (type !== 'coins') return amount.toString();
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
    }
    return amount.toString();
  };

  const handleClaimReward = async (day: number, reward: any) => {
    if (day !== currentDay || reward.is_claimed || claiming) return;
    
    setClaiming(day);
    
    try {
      await supabase
        .from('daily_rewards')
        .update({ 
          is_claimed: true,
          last_claim_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', reward.id);

      const updates: any = {};
      if (reward.reward_type === 'coins') {
        updates.coins = gameState.stats.coins + reward.reward_amount;
      } else if (reward.reward_type === 'spins') {
        updates.spins = gameState.stats.spins + reward.reward_amount;
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('stats')
          .update(updates)
          .eq('user_id', gameState.user.id);
      }

      toast({
        title: "¡Recompensa reclamada!",
        description: `+${formatAmount(reward.reward_amount, reward.reward_type)} ${reward.reward_type === 'coins' ? 'monedas' : 'giros'}`,
      });

      // Update local state instead of reloading
      Object.assign(gameState.stats, updates);
      reward.is_claimed = true;

    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Error",
        description: "No se pudo reclamar la recompensa",
        variant: "destructive"
      });
    } finally {
      setClaiming(null);
    }
  };

  const handleSpin = async () => {
    if (availableSpins <= 0 || spinning) return;

    setSpinning(true);
    
    const randomIndex = Math.floor(Math.random() * rewards.length);
    const sectionAngle = 360 / rewards.length;
    const newRotation = rotation + 360 * 5 + (randomIndex * sectionAngle) + (sectionAngle / 2);
    
    setRotation(newRotation);

    setTimeout(async () => {
      const selectedReward = rewards[randomIndex];
      
      try {
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

        // Update wheel stats - Corregir el contador de giros utilizados
        const currentSpinsUsed = gameState.rewardsWheel?.spins_used || 0;
        const currentRewardsClaimed = gameState.rewardsWheel?.total_rewards_claimed || 0;
        
        await supabase
          .from('rewards_wheel')
          .upsert({
            user_id: gameState.user.id,
            spins_used: currentSpinsUsed + 1,
            total_rewards_claimed: currentRewardsClaimed + 1,
            last_spin: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        toast({
          title: "¡Felicidades!",
          description: `Ganaste: ${selectedReward.label}`,
        });

        // Update local state instead of reloading
        Object.assign(gameState.stats, updates);
        
        // Update local rewards wheel state
        if (gameState.rewardsWheel) {
          gameState.rewardsWheel.spins_used = currentSpinsUsed + 1;
          gameState.rewardsWheel.total_rewards_claimed = currentRewardsClaimed + 1;
        } else {
          gameState.rewardsWheel = {
            spins_used: 1,
            total_rewards_claimed: 1,
            last_spin: new Date().toISOString()
          };
        }

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

  const getRewardIcon = (type: string) => {
    return type === 'coins' ? <Coins className="h-3 w-3 sm:h-4 sm:w-4" /> : <Zap className="h-3 w-3 sm:h-4 sm:w-4" />;
  };

  const getRewardColor = (type: string) => {
    return type === 'coins' ? 'text-yellow-400' : 'text-purple-400';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Daily Login Section */}
      <Card className="bg-gray-800/30 border-cyan-500/30">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-cyan-400 text-center flex items-center justify-center gap-2 text-sm sm:text-base">
            <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
            Login Diario
          </CardTitle>
          <p className="text-gray-400 text-xs sm:text-sm text-center">Día actual: {currentDay}</p>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const reward = dailyRewards.find((r: any) => r.day === day);
              const isCurrentDay = day === currentDay;
              const isClaimed = reward?.is_claimed || false;
              const isLocked = day !== currentDay && !isClaimed;

              return (
                <Card key={day} className={`relative ${
                  isClaimed ? 'bg-green-900/30 border-green-500/50' :
                  isCurrentDay ? 'bg-cyan-900/30 border-cyan-500/50' :
                  'bg-gray-900/30 border-gray-700/50'
                }`}>
                  <CardContent className="p-1.5 sm:p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Día {day}</div>
                    
                    {isClaimed ? (
                      <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-400 mx-auto mb-1" />
                    ) : isLocked ? (
                      <Lock className="h-4 w-4 sm:h-6 sm:w-6 text-gray-500 mx-auto mb-1" />
                    ) : (
                      <div className={`${getRewardColor(reward?.reward_type || 'coins')} mb-1 flex justify-center`}>
                        {getRewardIcon(reward?.reward_type || 'coins')}
                      </div>
                    )}
                    
                    <div className="text-xs">
                      {reward && (
                        <div className={`font-bold ${getRewardColor(reward.reward_type)} text-xs`}>
                          {formatAmount(reward.reward_amount, reward.reward_type)}
                        </div>
                      )}
                    </div>
                    
                    {isCurrentDay && !isClaimed && (
                      <Button
                        size="sm"
                        onClick={() => handleClaimReward(day, reward)}
                        disabled={claiming === day}
                        className="w-full mt-1 sm:mt-2 h-5 sm:h-6 text-xs bg-cyan-600 hover:bg-cyan-500 px-1"
                      >
                        {claiming === day ? 'Reclamando...' : 'Reclamar'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-gray-700/50" />

      {/* Rewards Wheel Section */}
      <Card className="bg-gray-800/30 border-purple-500/30">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-purple-400 text-center flex items-center justify-center gap-2 text-sm sm:text-base">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
            Ruleta de Recompensas
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center p-3 sm:p-6">
          {/* Wheel */}
          <div className="relative mx-auto mb-4 sm:mb-6" style={{ width: '200px', height: '200px' }}>
            <div 
              className="absolute inset-0 rounded-full border-2 sm:border-4 border-purple-500 transition-transform duration-3000 ease-out"
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
                      width: '40px',
                      height: '15px',
                      transform: `translate(-50%, -50%) rotate(${angle + 22.5}deg) translateY(-70px)`,
                      transformOrigin: 'center'
                    }}
                  >
                    <Icon className="h-2 w-2 sm:h-3 sm:w-3" />
                  </div>
                );
              })}
            </div>
            
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-2 border-r-2 border-b-4 sm:border-l-4 sm:border-r-4 sm:border-b-8 border-l-transparent border-r-transparent border-b-white z-10"></div>
          </div>

          {/* Spin Button */}
          <Card className="bg-gray-800/50 border-purple-500/50 mb-4">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                <span className="text-purple-400 font-bold text-sm sm:text-base">Giros disponibles: {availableSpins}</span>
              </div>
              <Button
                onClick={handleSpin}
                disabled={availableSpins <= 0 || spinning}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-sm sm:text-base"
              >
                {spinning ? 'Girando...' : availableSpins <= 0 ? 'Sin giros' : '¡Girar Ruleta!'}
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-sm">
            <Card className="bg-gray-800/30 border-gray-600/50">
              <CardContent className="p-2 sm:p-3 text-center">
                <div className="text-gray-400 text-xs sm:text-sm">Giros usados</div>
                <div className="text-white font-bold text-sm sm:text-base">{gameState.rewardsWheel?.spins_used || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/30 border-gray-600/50">
              <CardContent className="p-2 sm:p-3 text-center">
                <div className="text-gray-400 text-xs sm:text-sm">Recompensas</div>
                <div className="text-white font-bold text-sm sm:text-base">{gameState.rewardsWheel?.total_rewards_claimed || 0}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyRewards;
