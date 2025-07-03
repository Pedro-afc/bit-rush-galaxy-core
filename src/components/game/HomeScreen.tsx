
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
  const [miningProgress, setMiningProgress] = useState(0);
  const { toast } = useToast();

  const { stats } = gameState;

  const handleTap = async () => {
    if (!stats || stats.energy <= 0) {
      toast({
        title: "Sin energía",
        description: "Espera a que se recargue tu energía",
        variant: "destructive"
      });
      return;
    }

    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // Update stats
    const newCoins = stats.coins + stats.mining_rate;
    const newEnergy = Math.max(0, stats.energy - 1);
    const xpGain = Math.floor(stats.mining_rate * 0.1);
    const newXp = stats.xp + xpGain;

    try {
      await supabase
        .from('stats')
        .update({
          coins: newCoins,
          energy: newEnergy,
          xp: newXp,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', gameState.user.id);

      // Update local state
      gameState.stats = {
        ...stats,
        coins: newCoins,
        energy: newEnergy,
        xp: newXp
      };
    } catch (error) {
      console.error('Error updating tap:', error);
    }
  };

  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 100000) + 1;
  };

  const calculateXpForNextLevel = (xp: number) => {
    const currentLevel = calculateLevel(xp);
    const xpForNextLevel = currentLevel * 100000;
    return xpForNextLevel - xp;
  };

  const getEnergyRegenRate = () => {
    // Regen 1 energy per minute
    return 60000;
  };

  // Auto-regen energy
  useEffect(() => {
    const interval = setInterval(async () => {
      if (stats && stats.energy < stats.max_energy) {
        const newEnergy = Math.min(stats.max_energy, stats.energy + 1);
        
        try {
          await supabase
            .from('stats')
            .update({
              energy: newEnergy,
              last_energy_update: new Date().toISOString()
            })
            .eq('user_id', gameState.user.id);

          gameState.stats.energy = newEnergy;
        } catch (error) {
          console.error('Error updating energy:', error);
        }
      }
    }, getEnergyRegenRate());

    return () => clearInterval(interval);
  }, [stats, gameState.user]);

  if (!stats) return <div>Cargando...</div>;

  const level = calculateLevel(stats.xp);
  const xpProgress = (stats.xp % 100000) / 100000 * 100;
  const energyProgress = (stats.energy / stats.max_energy) * 100;

  return (
    <div className="h-full flex flex-col items-center justify-between p-4 relative overflow-hidden">
      {/* Header Stats */}
      <div className="w-full space-y-3">
        {/* Level Bar */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-cyan-400">Nivel {level}</span>
            <span className="text-xs text-gray-400">{stats.xp.toLocaleString()} XP</span>
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
            <span className="text-xs text-gray-400">{stats.energy}/{stats.max_energy}</span>
          </div>
          <Progress value={energyProgress} className="h-2" />
        </div>
      </div>

      {/* Floating Cards */}
      <div className="flex justify-center gap-4 my-8">
        <FloatingCard 
          name="explorer_stash" 
          title="Explorer Stash"
          floatingCards={gameState.floatingCards}
          userId={gameState.user.id}
        />
        <FloatingCard 
          name="crypto_cavern" 
          title="Crypto Cavern"
          floatingCards={gameState.floatingCards}
          userId={gameState.user.id}
        />
        <FloatingCard 
          name="skins" 
          title="Skins"
          floatingCards={[]}
          userId={gameState.user.id}
        />
      </div>

      {/* Main Tap Button */}
      <div className="flex-1 flex items-center justify-center">
        <Button
          onClick={handleTap}
          disabled={stats.energy <= 0}
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
          <div className="text-sm font-bold text-white">{stats.coins.toLocaleString()}</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-500/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Pickaxe className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-purple-400">Minería/h</span>
          </div>
          <div className="text-sm font-bold text-white">{stats.mining_rate.toLocaleString()}</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 border border-pink-500/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Star className="h-4 w-4 text-pink-400" />
            <span className="text-xs text-pink-400">Estrellas</span>
          </div>
          <div className="text-sm font-bold text-white">{stats.stars}</div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
