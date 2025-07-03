
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HomeScreen from './game/HomeScreen';
import CardsScreen from './game/CardsScreen';
import RewardsScreen from './game/RewardsScreen';
import ShopScreen from './game/ShopScreen';
import ReferralsScreen from './game/ReferralsScreen';
import { useGameState } from '@/hooks/useGameState';
import { Home, CreditCard, Gift, ShoppingBag, Users } from 'lucide-react';

const BitRushGame = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { gameState, loading } = useGameState();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-cyan-400 text-xl">Cargando Bit Rush...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <TabsContent value="home" className="h-full m-0">
            <HomeScreen gameState={gameState} />
          </TabsContent>
          <TabsContent value="cards" className="h-full m-0">
            <CardsScreen gameState={gameState} />
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
