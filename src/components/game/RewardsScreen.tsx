
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import DailyRewards from './rewards/DailyRewards';
import DailyMissions from './rewards/DailyMissions';
import Achievements from './rewards/Achievements';
import AirdropInfo from './rewards/AirdropInfo';

interface RewardsScreenProps {
  gameState: any;
}

const RewardsScreen: React.FC<RewardsScreenProps> = ({ gameState }) => {
  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">Recompensas</h1>
        
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 text-xs">
            <TabsTrigger value="daily" className="data-[state=active]:text-cyan-400">
              Daily
            </TabsTrigger>
            <TabsTrigger value="missions" className="data-[state=active]:text-green-400">
              Misiones
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:text-yellow-400">
              Logros
            </TabsTrigger>
            <TabsTrigger value="airdrop" className="data-[state=active]:text-purple-400">
              Airdrop
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <DailyRewards gameState={gameState} />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="missions" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <DailyMissions gameState={gameState} />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <Achievements gameState={gameState} />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="airdrop" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <AirdropInfo gameState={gameState} />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RewardsScreen;
