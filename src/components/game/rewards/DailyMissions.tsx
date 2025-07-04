
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Target, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DailyMissionsProps {
  gameState: any;
}

const DailyMissions: React.FC<DailyMissionsProps> = ({ gameState }) => {
  const { toast } = useToast();
  const [claiming, setClaiming] = useState<string | null>(null);

  const missions = gameState.dailyMissions || [];

  const handleClaimMission = async (mission: any) => {
    if (!mission.is_completed || mission.is_claimed || claiming) return;
    
    setClaiming(mission.id);
    
    try {
      // Mark mission as claimed and set 12-hour cooldown
      const cooldownTime = new Date();
      cooldownTime.setHours(cooldownTime.getHours() + 12);
      
      await supabase
        .from('daily_missions')
        .update({ 
          is_claimed: true,
          unlock_timer: cooldownTime.toISOString(),
          is_completed: false,
          current_value: 0
        })
        .eq('id', mission.id);

      // Add spins to player
      await supabase
        .from('stats')
        .update({ 
          spins: gameState.stats.spins + mission.reward_amount 
        })
        .eq('user_id', gameState.user.id);

      toast({
        title: "¡Misión completada!",
        description: `+${mission.reward_amount} giros de ruleta`,
      });

      // Refresh game state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error claiming mission:', error);
      toast({
        title: "Error",
        description: "No se pudo reclamar la misión",
        variant: "destructive"
      });
    } finally {
      setClaiming(null);
    }
  };

  const isOnCooldown = (mission: any) => {
    if (!mission.unlock_timer) return false;
    return new Date(mission.unlock_timer) > new Date();
  };

  const getCooldownTime = (mission: any) => {
    if (!mission.unlock_timer) return '';
    const now = new Date();
    const unlock = new Date(mission.unlock_timer);
    const diff = unlock.getTime() - now.getTime();
    
    if (diff <= 0) return '';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'taps': return '👆';
      case 'upgrades': return '⬆️';
      case 'coins_earned': return '💰';
      case 'level_reach': return '🏆';
      default: return '🎯';
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-white mb-4 text-center">Misiones Diarias</h2>
      
      <div className="space-y-4">
        {missions.map((mission: any) => {
          const progress = Math.min(100, (mission.current_value / mission.target_value) * 100);
          const onCooldown = isOnCooldown(mission);
          const cooldownTime = getCooldownTime(mission);
          
          return (
            <Card key={mission.id} className={`${
              mission.is_completed && !mission.is_claimed ? 'bg-green-900/20 border-green-500/50' :
              onCooldown ? 'bg-gray-900/30 border-gray-600/50 opacity-50' :
              'bg-gray-800/50 border-cyan-500/20'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getMissionIcon(mission.mission_type)}</div>
                    <div>
                      <h3 className={`font-bold text-sm ${onCooldown ? 'text-gray-500' : 'text-white'}`}>
                        {mission.mission_name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Target className="h-3 w-3" />
                        <span>{mission.current_value}/{mission.target_value}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-2 ${onCooldown ? 'text-gray-500' : 'text-purple-400'}`}>
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-bold">+{mission.reward_amount}</span>
                  </div>
                </div>
                
                <Progress value={progress} className="h-2 mb-3" />
                
                {onCooldown ? (
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Disponible en {cooldownTime}</span>
                  </div>
                ) : mission.is_completed && !mission.is_claimed ? (
                  <Button
                    onClick={() => handleClaimMission(mission)}
                    disabled={claiming === mission.id}
                    className="w-full bg-green-600 hover:bg-green-500"
                  >
                    {claiming === mission.id ? 'Reclamando...' : '¡Reclamar!'}
                  </Button>
                ) : mission.is_claimed || mission.is_completed ? (
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Completada</span>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 text-sm">
                    En progreso...
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DailyMissions;
