
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Lock, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DailyLoginProps {
  gameState: any;
}

const DailyLogin: React.FC<DailyLoginProps> = ({ gameState }) => {
  const { toast } = useToast();
  const today = new Date().getDate() % 7 + 1; // Simple day calculation for demo

  const claimDailyReward = async (day: number) => {
    const reward = gameState.dailyRewards.find((r: any) => r.day === day);
    if (!reward) return;

    try {
      // Update daily reward as claimed
      await supabase
        .from('daily_rewards')
        .update({
          is_claimed: true,
          last_claim_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', reward.id);

      // Update user stats
      await supabase
        .from('stats')
        .update({
          coins: gameState.stats.coins + reward.reward_amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', gameState.user.id);

      toast({
        title: "¡Recompensa reclamada!",
        description: `Has recibido ${reward.reward_amount} monedas`,
      });

      // Update local state
      reward.is_claimed = true;
      gameState.stats.coins += reward.reward_amount;

    } catch (error) {
      console.error('Error claiming daily reward:', error);
      toast({
        title: "Error",
        description: "No se pudo reclamar la recompensa",
        variant: "destructive"
      });
    }
  };

  const getDayStatus = (day: number) => {
    const reward = gameState.dailyRewards.find((r: any) => r.day === day);
    if (!reward) return 'locked';
    
    if (reward.is_claimed) return 'claimed';
    if (day === today) return 'available';
    if (day < today) return 'missed';
    return 'locked';
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Recompensas Diarias</h2>
        <p className="text-gray-400 text-sm">Inicia sesión cada día para recibir recompensas</p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
          const reward = gameState.dailyRewards.find((r: any) => r.day === day);
          const status = getDayStatus(day);
          
          return (
            <Card 
              key={day}
              className={`relative ${
                status === 'available' ? 'bg-green-900/30 border-green-500/50' :
                status === 'claimed' ? 'bg-blue-900/30 border-blue-500/50' :
                'bg-gray-900/30 border-gray-700/50'
              }`}
            >
              <CardContent className="p-2 text-center">
                <div className="text-xs text-gray-400 mb-1">Día {day}</div>
                
                {status === 'claimed' ? (
                  <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-1" />
                ) : status === 'locked' || status === 'missed' ? (
                  <Lock className="h-6 w-6 text-gray-500 mx-auto mb-1" />
                ) : (
                  <Coins className="h-6 w-6 text-green-400 mx-auto mb-1" />
                )}
                
                <div className="text-xs text-white font-bold">
                  {reward ? `${reward.reward_amount}` : '1000'}
                </div>
                
                {status === 'available' && (
                  <Button 
                    size="sm" 
                    onClick={() => claimDailyReward(day)}
                    className="w-full mt-1 h-6 text-xs bg-green-600 hover:bg-green-500"
                  >
                    Reclamar
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center text-sm text-gray-400">
        Día actual: {today}/7
      </div>
    </div>
  );
};

export default DailyLogin;
