
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Trophy, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AchievementsProps {
  gameState: any;
}

const Achievements: React.FC<AchievementsProps> = ({ gameState }) => {
  const { toast } = useToast();
  const [claiming, setClaiming] = useState<string | null>(null);

  const achievements = gameState.achievements || [];

  const handleClaimAchievement = async (achievement: any) => {
    if (!achievement.is_completed || achievement.is_claimed || claiming) return;
    
    setClaiming(achievement.id);
    
    try {
      // Mark achievement as claimed and set 12-hour cooldown
      const cooldownTime = new Date();
      cooldownTime.setHours(cooldownTime.getHours() + 12);
      
      await supabase
        .from('achievements')
        .update({ 
          is_claimed: true,
          unlock_timer: cooldownTime.toISOString()
        })
        .eq('id', achievement.id);

      // Add spins to player
      await supabase
        .from('stats')
        .update({ 
          spins: gameState.stats.spins + achievement.reward_amount 
        })
        .eq('user_id', gameState.user.id);

      toast({
        title: "¡Logro desbloqueado!",
        description: `+${achievement.reward_amount} giros de ruleta`,
      });

      // Refresh game state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error claiming achievement:', error);
      toast({
        title: "Error",
        description: "No se pudo reclamar el logro",
        variant: "destructive"
      });
    } finally {
      setClaiming(null);
    }
  };

  const isOnCooldown = (achievement: any) => {
    if (!achievement.unlock_timer) return false;
    return new Date(achievement.unlock_timer) > new Date();
  };

  const getCooldownTime = (achievement: any) => {
    if (!achievement.unlock_timer) return '';
    const now = new Date();
    const unlock = new Date(achievement.unlock_timer);
    const diff = unlock.getTime() - now.getTime();
    
    if (diff <= 0) return '';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getAchievementIcon = (name: string) => {
    if (name.includes('Nivel')) return '🏆';
    if (name.includes('Coleccionista')) return '🎴';
    if (name.includes('Millonario')) return '💰';
    if (name.includes('Minero')) return '⛏️';
    return '🏅';
  };

  const getAchievementRarity = (reward: number) => {
    if (reward >= 10) return { color: 'border-purple-500/50 bg-purple-900/20', text: 'text-purple-400', label: 'Legendario' };
    if (reward >= 5) return { color: 'border-yellow-500/50 bg-yellow-900/20', text: 'text-yellow-400', label: 'Épico' };
    if (reward >= 3) return { color: 'border-blue-500/50 bg-blue-900/20', text: 'text-blue-400', label: 'Raro' };
    return { color: 'border-gray-500/50 bg-gray-900/20', text: 'text-gray-400', label: 'Común' };
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-white mb-4 text-center">Logros</h2>
      
      <div className="space-y-4">
        {achievements.map((achievement: any) => {
          const progress = Math.min(100, (achievement.current_value / achievement.target_value) * 100);
          const onCooldown = isOnCooldown(achievement);
          const cooldownTime = getCooldownTime(achievement);
          const rarity = getAchievementRarity(achievement.reward_amount);
          
          return (
            <Card key={achievement.id} className={`${
              achievement.is_completed && !achievement.is_claimed ? `bg-green-900/20 border-green-500/50` :
              onCooldown ? 'bg-gray-900/30 border-gray-600/50 opacity-50' :
              rarity.color
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getAchievementIcon(achievement.achievement_name)}</div>
                    <div>
                      <h3 className={`font-bold text-sm ${onCooldown ? 'text-gray-500' : 'text-white'}`}>
                        {achievement.achievement_name}
                      </h3>
                      <p className={`text-xs mb-1 ${onCooldown ? 'text-gray-500' : 'text-gray-400'}`}>
                        {achievement.achievement_description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <Trophy className="h-3 w-3" />
                        <span className={onCooldown ? 'text-gray-500' : rarity.text}>{rarity.label}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-2 ${onCooldown ? 'text-gray-500' : 'text-purple-400'}`}>
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-bold">+{achievement.reward_amount}</span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progreso</span>
                    <span>{achievement.current_value}/{achievement.target_value}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                {onCooldown ? (
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Disponible en {cooldownTime}</span>
                  </div>
                ) : achievement.is_completed && !achievement.is_claimed ? (
                  <Button
                    onClick={() => handleClaimAchievement(achievement)}
                    disabled={claiming === achievement.id}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  >
                    {claiming === achievement.id ? 'Reclamando...' : '¡Reclamar Logro!'}
                  </Button>
                ) : achievement.is_claimed || achievement.is_completed ? (
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Completado</span>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 text-sm">
                    En progreso... ({Math.round(progress)}%)
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

export default Achievements;
