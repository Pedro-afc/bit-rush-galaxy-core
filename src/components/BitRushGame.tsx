
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import MockHomeScreen from './game/MockHomeScreen';
import CardsScreen from './game/CardsScreen';
import RewardsScreen from './game/RewardsScreen';
import ShopScreen from './game/ShopScreen';
import ReferralsScreen from './game/ReferralsScreen';
import { Home, CreditCard, Gift, ShoppingBag, Users, Wallet } from 'lucide-react';

// Mock game state for development
const mockGameState = {
  user: { id: 'mock-user', email: 'test@example.com' },
  stats: {
    level: 1,
    xp: 0,
    energy: 100,
    max_energy: 100,
    coins: 0,
    mining_rate: 1,
    spins: 3,
    stars: 0,
    ton_balance: 1000.0
  },
  cards: [],
  floatingCards: [
    // Mock Explorer Stash cards
    { id: '1', card_name: 'explorer_stash', position: 1, is_unlocked: true, is_claimed: false, reward_type: 'coins', reward_amount: 1000 },
    { id: '2', card_name: 'explorer_stash', position: 2, is_unlocked: true, is_claimed: false, reward_type: 'coins', reward_amount: 2000 },
    { id: '3', card_name: 'explorer_stash', position: 3, is_unlocked: true, is_claimed: false, reward_type: 'coins', reward_amount: 3000 },
    { id: '4', card_name: 'explorer_stash', position: 4, is_unlocked: false, is_claimed: false, reward_type: 'spins', reward_amount: 2, price_ton: 2.0 },
    // Mock Crypto Cavern cards
    { id: '5', card_name: 'crypto_cavern', position: 1, is_unlocked: true, is_claimed: false, reward_type: 'coins', reward_amount: 2000 },
    { id: '6', card_name: 'crypto_cavern', position: 2, is_unlocked: true, is_claimed: false, reward_type: 'coins', reward_amount: 4000 },
    { id: '7', card_name: 'crypto_cavern', position: 3, is_unlocked: true, is_claimed: false, reward_type: 'coins', reward_amount: 6000 },
    { id: '8', card_name: 'crypto_cavern', position: 4, is_unlocked: false, is_claimed: false, reward_type: 'spins', reward_amount: 3, price_ton: 3.0 },
  ],
  dailyRewards: [
    { id: '1', day: 1, reward_type: 'coins', reward_amount: 1000, is_claimed: false },
    { id: '2', day: 2, reward_type: 'coins', reward_amount: 2000, is_claimed: false },
    { id: '3', day: 3, reward_type: 'coins', reward_amount: 3000, is_claimed: false },
  ],
  dailyMissions: [
    { id: '1', mission_name: 'Haz 50 clics', mission_type: 'taps', target_value: 50, current_value: 0, reward_type: 'spins', reward_amount: 1, is_completed: false, is_claimed: false },
    { id: '2', mission_name: 'Mejora 3 cartas', mission_type: 'upgrades', target_value: 3, current_value: 0, reward_type: 'spins', reward_amount: 1, is_completed: false, is_claimed: false },
  ],
  achievements: [
    { id: '1', achievement_name: 'Primer Nivel', achievement_description: 'Alcanza el nivel 5', target_value: 5, current_value: 0, reward_type: 'spins', reward_amount: 2, is_completed: false, is_claimed: false },
    { id: '2', achievement_name: 'Millonario', achievement_description: 'Acumula 100,000 monedas', target_value: 100000, current_value: 0, reward_type: 'spins', reward_amount: 5, is_completed: false, is_claimed: false },
  ],
  shopItems: [],
  rewardsWheel: { id: '1', spins_used: 0, total_rewards_claimed: 0 }
};

const BitRushGame = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [gameState, setGameState] = useState(mockGameState);

  const refreshGameState = () => {
    console.log('Refreshing game state (mock mode)');
    // In mock mode, just log that refresh was called
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Wallet className="h-5 w-5" />
            <div className="flex flex-col">
              <span className="text-sm">Bit Rush</span>
              <span className="text-xs text-gray-400 font-mono">
                Modo desarrollo
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Mock Mode
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
