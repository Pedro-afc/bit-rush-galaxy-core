
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, Coins, Star, Pickaxe } from 'lucide-react';
import FloatingCard from './FloatingCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HomeScreenProps {
  gameState: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ gameState }) => {
  const [tapCount, setTapCount] = useState(0);
  const [localGameState, setLocalGameState] = useState(gameState);
  const { toast } = useToast();

  // Update local state when gameState changes
  useEffect(() => {
    setLocalGameState(gameState);
  }, [gameState]);

  const refreshGameState = async () => {
    try {
      // Reload floating cards data
      const { data: floatingCards } = await supabase
        .from('floating_cards')
        .select('*')
        .eq('user_id', gameState.user.id)
        .order('card_name, position');

      // Reload stats
      const { data: stats } = await supabase
        .from('stats')
        .select('*')
        .eq('user_id', gameState.user.id)
        .single();

      setLocalGameState(prev => ({
        ...prev,
        floatingCards: floatingCards || [],
        stats: stats || prev.stats
      }));
    } catch (error) {
      console.error('Error refreshing game state:', error);
    }
  };

  const handleTap = async () => {
    if (!localGameState.stats || localGameState.stats.energy <= 0) {
      toast({
        title: "Sin energía",
        description: "Espera a que se recargue tu energía",
        variant: "destructive"
      });
      return;
    }

    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // Calculate rewards
    const coinsGained = localGameState.stats.mining_rate;
    const xpGain = Math.floor(localGameState.stats.mining_rate * 0.1);

    const newCoins = localGameState.stats.coins + coinsGained;
    const newEnergy = Math.max(0, localGameState.stats.energy - 1);
    const newXp = localGameState.stats.xp + xpGain;

    try {
      await supabase
        .from('stats')
        .update({
          coins: newCoins,
          energy: newEnergy,
          xp: newXp,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', localGameState.user.id);

      // Update local state immediately
      setLocalGameState(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          coins: newCoins,
          energy: newEnergy,
          xp: newXp
        }
      }));

      // Update mission progress for taps
      await updateMissionProgress('taps', 1);
      await updateMissionProgress('coins_earned', coinsGained);

      // Update achievements
      const currentLevel = calculateLevel(newXp);
      await updateAchievementProgress('Primer Nivel', currentLevel);
      await updateAchievementProgress('Millonario', newCoins);

    } catch (error) {
      console.error('Error updating tap:', error);
    }
  };

  const updateMissionProgress = async (missionType: string, value: number) => {
    const mission = localGameState.dailyMissions.find((m: any) => m.mission_type === missionType);
    if (!mission || mission.is_completed) return;

    const newValue = Math.min(mission.target_value, mission.current_value + value);
    const isCompleted = newValue >= mission.target_value;

    try {
      await supabase
        .from('daily_missions')
        .update({
          current_value: newValue,
          is_completed: isCompleted
        })
        .eq('id', mission.id);
    } catch (error) {
      console.error('Error updating mission progress:', error);
    }
  };

  const updateAchievementProgress = async (achievementName: string, value: number) => {
    const achievement = localGameState.achievements.find((a: any) => a.achievement_name === achievementName);
    if (!achievement || achievement.is_completed) return;

    const newValue = Math.min(achievement.target_value, value);
    const isCompleted = newValue >= achievement.target_value;

    try {
      await supabase
        .from('achievements')
        .update({
          current_value: newValue,
          is_completed: isCompleted
        })
        .eq('id', achievement.id);
    } catch (error) {
      console.error('Error updating achievement progress:', error);
    }
  };

  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 100000) + 1;
  };

  const getEnergyRegenRate = () => {
    // Regen 1 energy per minute
    return 60000;
  };

  // Auto-regen energy
  useEffect(() => {
    const interval = setInterval(async () => {
      if (localGameState.stats && localGameState.stats.energy < localGameState.stats.max_energy) {
        const newEnergy = Math.min(localGameState.stats.max_energy, localGameState.stats.energy + 1);
        
        try {
          await supabase
            .from('stats')
            .update({
              energy: newEnergy,
              last_energy_update: new Date().toISOString()
            })
            .eq('user_id', localGameState.user.id);

          setLocalGameState(prev => ({
            ...prev,
            stats: {
              ...prev.stats,
              energy: newEnergy
            }
          }));
        } catch (error) {
          console.error('Error updating energy:', error);
        }
      }
    }, getEnergyRegenRate());

    return () => clearInterval(interval);
  }, [localGameState.stats, localGameState.user]);

  if (!localGameState.stats) return <div>Cargando...</div>;

  const level = calculateLevel(localGameState.stats.xp);
  const xpProgress = (localGameState.stats.xp % 100000) / 100000 * 100;
  const energyProgress = (localGameState.stats.energy / localGameState.stats.max_energy) * 100;

  return (
    <div className="h-full flex flex-col items-center justify-between p-4 relative overflow-hidden">
      {/* Header Stats */}
      <div className="w-full space-y-3">
        {/* Level Bar */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-cyan-400">Nivel {level}</span>
            <span className="text-xs text-gray-400">{localGameState.stats.xp.toLocaleString()} XP</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>

        {/* Energy Bar */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-yellow-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">Energía</span>
            </div>
            <span className="text-xs text-gray-400">{localGameState.stats.energy}/{localGameState.stats.max_energy}</span>
          </div>
          <Progress value={energyProgress} className="h-2" />
        </div>
      </div>

      {/* Floating Cards */}
      <div className="flex justify-center gap-4 my-8">
        <FloatingCard 
          name="explorer_stash" 
          title="Explorer Stash"
          floatingCards={localGameState.floatingCards}
          userId={localGameState.user.id}
          onStateUpdate={refreshGameState}
        />
        <FloatingCard 
          name="crypto_cavern" 
          title="Crypto Cavern"
          floatingCards={localGameState.floatingCards}
          userId={localGameState.user.id}
          onStateUpdate={refreshGameState}
        />
        <FloatingCard 
          name="skins" 
          title="Skins"
          floatingCards={[]}
          userId={localGameState.user.id}
          onStateUpdate={refreshGameState}
        />
      </div>

      {/* Main Tap Button */}
      <div className="flex-1 flex items-center justify-center">
        <Button
          onClick={handleTap}
          disabled={localGameState.stats.energy <= 0}
          className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 shadow-lg shadow-cyan-500/25 border-2 border-cyan-400/50"
        >
          <Pickaxe className="h-12 w-12 text-white" />
        </Button>
      </div>

      {/* Bottom Stats */}
      <div className="w-full grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-green-500/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Coins className="h-4 w-4 text-green-400" />
            <span className="text-xs text-green-400">Monedas</span>
          </div>
          <div className="text-sm font-bold text-white">{localGameState.stats.coins.toLocaleString()}</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-500/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Pickaxe className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-purple-400">Minería/h</span>
          </div>
          <div className="text-sm font-bold text-white">{localGameState.stats.mining_rate.toLocaleString()}</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 border border-pink-500/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Star className="h-4 w-4 text-pink-400" />
            <span className="text-xs text-pink-400">Giros</span>
          </div>
          <div className="text-sm font-bold text-white">{localGameState.stats.spins || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
