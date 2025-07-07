import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import MockHomeScreen from './game/MockHomeScreen';
import CardsScreen from './game/CardsScreen';
import RewardsScreen from './game/RewardsScreen';
import ShopScreen from './game/ShopScreen';
import ReferralsScreen from './game/ReferralsScreen';
import { Home, CreditCard, Gift, ShoppingBag, Users, Wallet } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from './auth/AuthPage';

const BitRushGame = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { gameState, loading, refreshGameState } = useGameState();
  const { user, isAuthenticated, logout } = useAuth();

  // Show loading state while game data is being loaded
  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400">Cargando juego...</p>
        </div>
      </div>
    );
  }

  // Mostrar AuthPage si no está autenticado
  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-2 sm:p-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm">Bit Rush</span>
              <span className="text-xs text-gray-400 font-mono">
                {user.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : 'Conectado'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-xs text-gray-400">
              {gameState.stats ? `Nivel ${gameState.stats.level}` : 'Cargando...'}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Desconectar
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="home" className="h-full m-0">
            <MockHomeScreen gameState={gameState} />
          </TabsContent>
          <TabsContent value="cards" className="h-full m-0">
            <CardsScreen gameState={gameState} refreshGameState={refreshGameState} />
          </TabsContent>
          <TabsContent value="rewards" className="h-full m-0">
            <RewardsScreen gameState={gameState} />
          </TabsContent>
          <TabsContent value="shop" className="h-full m-0">
            <ShopScreen gameState={gameState} />
          </TabsContent>
          <TabsContent value="referrals" className="h-full m-0">
            <ReferralsScreen gameState={gameState} />
          </TabsContent>
        </div>
        
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border-t border-cyan-500/20 rounded-none h-12 sm:h-16">
          <TabsTrigger value="home" className="flex flex-col items-center gap-1 text-xs data-[state=active]:text-cyan-400">
            <Home size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Home</span>
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex flex-col items-center gap-1 text-xs data-[state=active]:text-cyan-400">
            <CreditCard size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Cartas</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex flex-col items-center gap-1 text-xs data-[state=active]:text-cyan-400">
            <Gift size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="shop" className="flex flex-col items-center gap-1 text-xs data-[state=active]:text-cyan-400">
            <ShoppingBag size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Shop</span>
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex flex-col items-center gap-1 text-xs data-[state=active]:text-cyan-400">
            <Users size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Referidos</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default BitRushGame;
