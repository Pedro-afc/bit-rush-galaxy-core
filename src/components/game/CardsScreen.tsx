import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import CardCategory from './CardCategory';

interface CardsScreenProps {
  gameState: any;
  refreshGameState: () => void;
}

const CardsScreen: React.FC<CardsScreenProps> = ({ gameState, refreshGameState }) => {
  const commonCards = [
    { name: 'Minero Básico', level: 1, miningBonus: 2, priceCoins: 1000, description: 'Tu primera herramienta de minería', icon: '⛏️' },
    { name: 'Excavadora Simple', level: 1, miningBonus: 5, priceCoins: 2500, description: 'Excavación mejorada', icon: '🚜' },
    { name: 'Procesador CPU', level: 1, miningBonus: 8, priceCoins: 5000, description: 'Procesamiento básico', icon: '💻' },
    { name: 'Scanner Digital', level: 1, miningBonus: 12, priceCoins: 8000, description: 'Exploración digital', icon: '📡' },
  ];

  const rareCards = [
    { name: 'Taladro Avanzado', level: 1, miningBonus: 20, priceCoins: 15000, description: 'Perforación profunda', icon: '🔩' },
    { name: 'Motor Turbo', level: 1, miningBonus: 35, priceCoins: 25000, description: 'Velocidad mejorada', icon: '⚡' },
    { name: 'Chip Neural', level: 1, miningBonus: 50, priceCoins: 40000, description: 'Inteligencia artificial', icon: '🧠' },
    { name: 'Reactor Plasma', level: 1, miningBonus: 75, priceCoins: 60000, description: 'Energía de plasma', icon: '⚛️' },
  ];

  const epicCards = [
    { name: 'Extractor Cuántico', level: 1, miningBonus: 100, priceCoins: 100000, description: 'Tecnología cuántica', icon: '🔬' },
    { name: 'Matrix Core', level: 1, miningBonus: 150, priceCoins: 150000, description: 'Núcleo de matrix', icon: '🌐' },
    { name: 'Nano Processor', level: 1, miningBonus: 200, priceCoins: 250000, description: 'Procesamiento molecular', icon: '⚗️' },
    { name: 'Holo Engine', level: 1, miningBonus: 300, priceCoins: 400000, description: 'Motor holográfico', icon: '🔮' },
  ];

  const eliteCards = [
    { name: 'Cyber Core', level: 1, miningBonus: 500, priceTon: 1.0, description: 'Núcleo cibernético avanzado', icon: '🤖' },
    { name: 'Matrix Engine', level: 1, miningBonus: 750, priceTon: 2.0, description: 'Motor de realidad virtual', icon: '🎮' },
    { name: 'Neural Net', level: 1, miningBonus: 1000, priceTon: 3.5, description: 'Red neuronal artificial', icon: '🧬' },
    { name: 'Quantum Mind', level: 1, miningBonus: 1500, priceTon: 5.0, description: 'Conciencia cuántica', icon: '🌌' },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">Cartas de Minería</h1>
        
        <Tabs defaultValue="common" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 mb-4">
            <TabsTrigger value="common" className="data-[state=active]:text-green-400 text-xs">
              Comunes
            </TabsTrigger>
            <TabsTrigger value="rare" className="data-[state=active]:text-blue-400 text-xs">
              Raras
            </TabsTrigger>
            <TabsTrigger value="epic" className="data-[state=active]:text-purple-400 text-xs">
              Épicas
            </TabsTrigger>
            <TabsTrigger value="elite" className="data-[state=active]:text-yellow-400 text-xs">
              Elite
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="common" className="mt-4">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <CardCategory 
                title="Cartas Comunes"
                cards={commonCards}
                gameState={gameState}
                type="common"
                categoryColor="text-green-400"
                refreshGameState={refreshGameState}
              />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="rare" className="mt-4">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <CardCategory 
                title="Cartas Raras"
                cards={rareCards}
                gameState={gameState}
                type="rare"
                categoryColor="text-blue-400"
                refreshGameState={refreshGameState}
              />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="epic" className="mt-4">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <CardCategory 
                title="Cartas Épicas"
                cards={epicCards}
                gameState={gameState}
                type="epic"
                categoryColor="text-purple-400"
                refreshGameState={refreshGameState}
              />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="elite" className="mt-4">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <CardCategory 
                title="Cartas Elite"
                cards={eliteCards}
                gameState={gameState}
                type="elite"
                categoryColor="text-yellow-400"
                refreshGameState={refreshGameState}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CardsScreen;
