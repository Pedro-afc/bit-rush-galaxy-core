import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, Coins, Star, Pickaxe } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';

interface MockHomeScreenProps {
  gameState: any;
}

const MockHomeScreen: React.FC<MockHomeScreenProps> = ({ gameState }) => {
  const [localStats, setLocalStats] = useState(gameState.stats);
  const [tapCount, setTapCount] = useState(0);
  const { updateStats } = useGameState();

  // Sincronizar con el estado global cuando cambie
  useEffect(() => {
    setLocalStats(gameState.stats);
  }, [gameState.stats]);

  // Sistema de regeneración de energía
  useEffect(() => {
    const energyInterval = setInterval(() => {
      if (localStats.energy < localStats.max_energy) {
        setLocalStats(prev => ({
          ...prev,
          energy: Math.min(prev.max_energy, prev.energy + 1)
        }));
      }
    }, 6000); // Regenera 1 energía cada 6 segundos

    return () => clearInterval(energyInterval);
  }, [localStats.energy, localStats.max_energy]);

  const handleTap = () => {
    if (localStats.energy <= 0) {
      return;
    }

    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // Update local stats immediately for responsive UI
    const coinsGained = localStats.mining_rate;
    const xpGain = Math.floor(localStats.mining_rate * 0.1);

    const newStats = {
      ...localStats,
      coins: localStats.coins + coinsGained,
      energy: Math.max(0, localStats.energy - 1),
      xp: localStats.xp + xpGain
    };

    setLocalStats(newStats);

    // Actualizar el estado global
    updateStats({
      coins: newStats.coins,
      energy: newStats.energy,
      xp: newStats.xp
    });

    console.log(`Tap ${newTapCount}: +${coinsGained} coins, +${xpGain} XP, Energy: ${newStats.energy}`);
  };

  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 100000) + 1;
  };

  const level = calculateLevel(localStats.xp);
  const xpProgress = (localStats.xp % 100000) / 100000 * 100;
  const energyProgress = (localStats.energy / localStats.max_energy) * 100;

  return (
    <div className="h-full flex flex-col items-center justify-between p-2 sm:p-4 relative overflow-hidden">
      {/* Header Stats */}
      <div className="w-full space-y-2 sm:space-y-3">
        {/* Level Bar */}
        <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-cyan-400">Nivel {level}</span>
            <span className="text-xs text-gray-400">{localStats.xp.toLocaleString()} XP</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>

        {/* Energy Bar */}
        <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-yellow-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
              <span className="text-xs sm:text-sm text-yellow-400">Energía</span>
            </div>
            <span className="text-xs text-gray-400">{localStats.energy}/{localStats.max_energy}</span>
          </div>
          <Progress value={energyProgress} className="h-2" />
        </div>
      </div>

      {/* Mock Floating Cards Area */}
      <div className="flex justify-center gap-1 sm:gap-2 my-2 sm:my-4">
        <div className="w-12 h-16 sm:w-16 sm:h-20 bg-gradient-to-b from-purple-600 to-purple-800 rounded-lg border border-purple-400/30 flex items-center justify-center">
          <span className="text-xs text-white text-center">Explorer<br/>Stash</span>
        </div>
        <div className="w-12 h-16 sm:w-16 sm:h-20 bg-gradient-to-b from-blue-600 to-blue-800 rounded-lg border border-blue-400/30 flex items-center justify-center">
          <span className="text-xs text-white text-center">Crypto<br/>Cavern</span>
        </div>
        <div className="w-12 h-16 sm:w-16 sm:h-20 bg-gradient-to-b from-gray-600 to-gray-800 rounded-lg border border-gray-400/30 flex items-center justify-center">
          <span className="text-xs text-white text-center">Skins</span>
        </div>
      </div>

      {/* Main Tap Button */}
      <div className="flex-1 flex items-center justify-center">
        <Button
          onClick={handleTap}
          onTouchStart={handleTap}
          disabled={localStats.energy <= 0}
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 disabled:opacity-50 shadow-lg shadow-cyan-500/25 border-2 border-cyan-400/50 transition-all duration-150 touch-manipulation"
          style={{
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        >
          <Pickaxe className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
        </Button>
      </div>

      {/* Bottom Stats */}
      <div className="w-full grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-green-500/20 text-center">
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
            <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
            <span className="text-xs text-green-400">Monedas</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-white">{localStats.coins.toLocaleString()}</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-purple-500/20 text-center">
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
            <Pickaxe className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
            <span className="text-xs text-purple-400">Minería/h</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-white">{localStats.mining_rate.toLocaleString()}</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-pink-500/20 text-center">
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-pink-400" />
            <span className="text-xs text-pink-400">Giros</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-white">{localStats.spins || 0}</div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="absolute top-2 right-2 text-xs text-gray-500">
        Taps: {tapCount}
      </div>
    </div>
  );
};

export default MockHomeScreen;
