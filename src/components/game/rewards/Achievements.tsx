
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Timer, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AchievementsProps {
  gameState: any;
}

const Achievements: React.FC<AchievementsProps> = ({ gameState }) => {
  const { toast } = useToast();

  const claimAchievement = async (achievement: any) => {
    if (!achievement.is_completed || achievement.is_claimed) return;

    try {
      // Set 12-hour timer
      const unlockTime = new Date();
      unlockTime.setHours(unlockTime.getHours() + 12);

      // Update achievement
      await supabase
        .from('achievements')
        .update({
          is_claimed: true,
          unlock_timer: unlockTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', achievement.id);

      // Update user stats
      const updates: any = {
        updated_at: new Date().toISOString()
      };

      switch (achievement.reward_type) {
        case 'coins':
          updates.coins = gameState.stats.coins + achievement.reward_amount;
          break;
        case 'stars':
          updates.stars = gameState.stats.stars + achievement.reward_amount;
          break;
        case 'spins':
          updates.spins = gameState.stats.spins + achievement.reward_amount;
          break;
        case 'ton':
          updates.ton_balance = gameState.stats.ton_balance + achievement.reward_amount;
          break;
      }

      await supabase
        .from('stats')
        .update(updates)
        .eq('user_id', gameState.user.id);

      toast({
        title: "¡Logro desbloqueado!",
        description: `Has recibido ${achievement.reward_amount} ${achievement.reward_type}`,
      });

      // Update local state
      achievement.is_claimed = true;
      achievement.unlock_timer = unlockTime.toISOString();
      Object.assign(gameState.stats, updates);

    } catch (error) {
      console.error('Error claiming achievement:', error);
      toast({
        title: "Error",
        description: "No se pudo reclamar el logro",
        variant: "destructive"
      });
    }
  };

  const isAchievementOnTimer = (achievement: any) => {
    if (!achievement.unlock_timer) return false;
    return new Date() < new Date(achievement.unlock_timer);
  };

  const getAchievementProgress = (achievement: any) => {
    return Math.min(100, (achievement.current_value / achievement.target_value) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Logros</h2>
        <p className="text-gray-400 text-sm">Desbloquea logros para obtener recompensas especiales</p>
      </div>

      <div className="space-y-3">
        {gameState.achievements.map((achievement: any, index: number) => {
          const progress = getAchievementProgress(achievement);
          const onTimer = isAchievementOnTimer(achievement);
          
          return (
            <Card key={index} className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  {achievement.achievement_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievement.achievement_description && (
                  <p className="text-gray-400 text-sm">{achievement.achievement_description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progreso</span>
                    <span className="text-white">{achievement.current_value}/{achievement.target_value}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-yellow-400">
                    +{achievement.reward_amount} {achievement.reward_type}
                  </div>
                  
                  <div>
                    {achievement.is_claimed && onTimer ? (
                      <div className="flex items-center gap-2 text-orange-400 text-sm">
                        <Timer className="h-4 w-4" />
                        <span>12h restantes</span>
                      </div>
                    ) : achievement.is_claimed ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>Completado</span>
                      </div>
                    ) : achievement.is_completed ? (
                      <Button 
                        size="sm"
                        onClick={() => claimAchievement(achievement)}
                        className="bg-yellow-600 hover:bg-yellow-500"
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

export default Achievements;
