
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Timer, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DailyMissionsProps {
  gameState: any;
}

const DailyMissions: React.FC<DailyMissionsProps> = ({ gameState }) => {
  const { toast } = useToast();

  const claimMission = async (mission: any) => {
    if (!mission.is_completed || mission.is_claimed) return;

    try {
      // Set 12-hour timer
      const unlockTime = new Date();
      unlockTime.setHours(unlockTime.getHours() + 12);

      // Update mission
      await supabase
        .from('daily_missions')
        .update({
          is_claimed: true,
          unlock_timer: unlockTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', mission.id);

      // Update user stats
      const updates: any = {
        updated_at: new Date().toISOString()
      };

      switch (mission.reward_type) {
        case 'coins':
          updates.coins = gameState.stats.coins + mission.reward_amount;
          break;
        case 'stars':
          updates.stars = gameState.stats.stars + mission.reward_amount;
          break;
        case 'spins':
          updates.spins = gameState.stats.spins + mission.reward_amount;
          break;
      }

      await supabase
        .from('stats')
        .update(updates)
        .eq('user_id', gameState.user.id);

      toast({
        title: "¡Misión completada!",
        description: `Has recibido ${mission.reward_amount} ${mission.reward_type}`,
      });

      // Update local state
      mission.is_claimed = true;
      mission.unlock_timer = unlockTime.toISOString();
      Object.assign(gameState.stats, updates);

    } catch (error) {
      console.error('Error claiming mission:', error);
      toast({
        title: "Error",
        description: "No se pudo reclamar la misión",
        variant: "destructive"
      });
    }
  };

  const isMissionOnTimer = (mission: any) => {
    if (!mission.unlock_timer) return false;
    return new Date() < new Date(mission.unlock_timer);
  };

  const getMissionProgress = (mission: any) => {
    return Math.min(100, (mission.current_value / mission.target_value) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Misiones Diarias</h2>
        <p className="text-gray-400 text-sm">Completa misiones para ganar recompensas</p>
      </div>

      <div className="space-y-3">
        {gameState.dailyMissions.map((mission: any, index: number) => {
          const progress = getMissionProgress(mission);
          const onTimer = isMissionOnTimer(mission);
          
          return (
            <Card key={index} className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-cyan-400" />
                  {mission.mission_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progreso</span>
                    <span className="text-white">{mission.current_value}/{mission.target_value}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-purple-400">
                    +{mission.reward_amount} {mission.reward_type}
                  </div>
                  
                  <div>
                    {mission.is_claimed && onTimer ? (
                      <div className="flex items-center gap-2 text-orange-400 text-sm">
                        <Timer className="h-4 w-4" />
                        <span>12h restantes</span>
                      </div>
                    ) : mission.is_claimed ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>Completado</span>
                      </div>
                    ) : mission.is_completed ? (
                      <Button 
                        size="sm"
                        onClick={() => claimMission(mission)}
                        className="bg-green-600 hover:bg-green-500"
                      >
                        Reclamar
                      </Button>
                    ) : (
                      <span className="text-gray-500 text-sm">En progreso</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DailyMissions;
