
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import HomeScreen from './game/HomeScreen';
import CardsScreen from './game/CardsScreen';
import RewardsScreen from './game/RewardsScreen';
import ShopScreen from './game/ShopScreen';
import ReferralsScreen from './game/ReferralsScreen';
import AuthPage from './auth/AuthPage';
import { useAuth } from '@/hooks/useAuth';
import { useSecureGameState } from '@/hooks/useSecureGameState';
import { Home, CreditCard, Gift, ShoppingBag, Users, LogOut, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BitRushGame = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { user, loading: authLoading, signOut, isAuthenticated, walletInfo } = useAuth();
  const { gameState, loading: gameLoading, refreshGameState } = useSecureGameState();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo desconectar la wallet",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Wallet desconectada",
        description: "Tu wallet se ha desconectado correctamente"
      });
    }
  };

  const handleAuthSuccess = () => {
    // Auth state will be handled by useAuth hook
    refreshGameState();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-cyan-400 text-xl flex items-center gap-2">
          <Wallet className="h-6 w-6 animate-pulse" />
          Conectando wallet...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (gameLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-cyan-400 text-xl">Cargando Bit Rush...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        {/* Header with wallet info and logout */}
        <div className="flex justify-between items-center p-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Wallet className="h-5 w-5" />
            <div className="flex flex-col">
              <span className="text-sm">Bit Rush</span>
              {walletInfo?.isWalletUser && (
                <span className="text-xs text-gray-400 font-mono">
                  {walletInfo.address?.slice(0, 8)}...{walletInfo.address?.slice(-6)}
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Desconectar
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="home" className="h-full m-0">
            <HomeScreen gameState={gameState} />
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
        
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border-t border-cyan-500/20 rounded-none h-16">
          <TabsTrigger value="home" className="flex flex-col items-center gap-1 text-xs data-[state=active]:text-cyan-400">
            <Home size={20} />
            <span>Home</span>
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex flex-col items-center gap-1 text-xs data-[state=active]:text-cyan-400">
            <CreditCard size={20} />
            <span>Cartas</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex flex-col items-center gap-1 text-xs data-[state=active]:text-cyan-400">
            <Gift size={20} />
            <span>Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="shop" className="flex flex-col items-center gap-1 text-xs data-[state=active]:text-cyan-400">
            <ShoppingBag size={20} />
            <span>Shop</span>
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex flex-col items-center gap-1 text-xs data-[state=active]:text-cyan-400">
            <Users size={20} />
            <span>Referidos</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default BitRushGame;
