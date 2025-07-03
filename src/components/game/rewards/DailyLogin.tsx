
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Lock, Coins, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DailyLoginProps {
  gameState: any;
}

const DailyLogin: React.FC<DailyLoginProps> = ({ gameState }) => {
  const { toast } = useToast();
  const [claiming, setClaiming] = useState<number | null>(null);

  const dailyRewards = gameState.dailyRewards || [];
  const currentDay = Math.min(7, Math.max(1, (gameState.stats?.level || 1) % 7 || 1));

  const handleClaimReward = async (day: number, reward: any) => {
    if (day !== currentDay || reward.is_claimed || claiming) return;
    
    setClaiming(day);
    
    try {
      // Update reward as claimed
      await supabase
        .from('daily_rewards')
        .update({ 
          is_claimed: true,
          last_claim_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', reward.id);

      // Update player stats
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
        description: `+${reward.reward_amount} ${reward.reward_type === 'coins' ? 'monedas' : 'giros'}`,
      });

      // Refresh game state
      window.location.reload();
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

  const getRewardIcon = (type: string) => {
    return type === 'coins' ? <Coins className="h-4 w-4" /> : <Zap className="h-4 w-4" />;
  };

  const getRewardColor = (type: string) => {
    return type === 'coins' ? 'text-yellow-400' : 'text-purple-400';
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-white mb-4 text-center">Login Diario</h2>
      <p className="text-gray-400 text-sm text-center mb-6">Día actual: {currentDay}</p>
      
      <div className="grid grid-cols-7 gap-2">
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
              <CardContent className="p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Día {day}</div>
                
                {isClaimed ? (
                  <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-1" />
                ) : isLocked ? (
                  <Lock className="h-6 w-6 text-gray-500 mx-auto mb-1" />
                ) : (
                  <div className={`${getRewardColor(reward?.reward_type || 'coins')} mb-1`}>
                    {getRewardIcon(reward?.reward_type || 'coins')}
                  </div>
                )}
                
                <div className="text-xs">
                  {reward && (
                    <div className={`font-bold ${getRewardColor(reward.reward_type)}`}>
                      {reward.reward_amount}
                    </div>
                  )}
                </div>
                
                {isCurrentDay && !isClaimed && (
                  <Button
                    size="sm"
                    onClick={() => handleClaimReward(day, reward)}
                    disabled={claiming === day}
                    className="w-full mt-2 h-6 text-xs bg-cyan-600 hover:bg-cyan-500"
                  >
                    {claiming === day ? 'Reclamando...' : 'Reclamar'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DailyLogin;
