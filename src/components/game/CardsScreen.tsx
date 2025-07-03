
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import CardCategory from './CardCategory';

interface CardsScreenProps {
  gameState: any;
}

const CardsScreen: React.FC<CardsScreenProps> = ({ gameState }) => {
  const miningCards = [
    { name: 'Basic Miner', level: 1, miningBonus: 2, priceCoins: 1000, description: 'Tu primera herramienta de minería' },
    { name: 'Advanced Drill', level: 1, miningBonus: 5, priceCoins: 5000, description: 'Perforación más profunda' },
    { name: 'Quantum Extractor', level: 1, miningBonus: 10, priceCoins: 25000, description: 'Tecnología cuántica' },
    { name: 'Nano Processor', level: 1, miningBonus: 25, priceCoins: 100000, description: 'Procesamiento molecular' },
  ];

  const eliteCards = [
    { name: 'Cyber Core', level: 1, miningBonus: 50, priceTon: 0.5, description: 'Núcleo cibernético avanzado' },
    { name: 'Matrix Engine', level: 1, miningBonus: 100, priceTon: 1.0, description: 'Motor de realidad virtual' },
    { name: 'Neural Net', level: 1, miningBonus: 200, priceTon: 2.0, description: 'Red neuronal artificial' },
    { name: 'Quantum Mind', level: 1, miningBonus: 500, priceTon: 5.0, description: 'Conciencia cuántica' },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">Cartas de Minería</h1>
        
        <Tabs defaultValue="mining" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
            <TabsTrigger value="mining" className="data-[state=active]:text-cyan-400">
              Minería
            </TabsTrigger>
            <TabsTrigger value="elite" className="data-[state=active]:text-purple-400">
              Elite
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="mining" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <CardCategory 
                title="Herramientas de Minería"
                cards={miningCards}
                gameState={gameState}
                type="mining"
              />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="elite" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <CardCategory 
                title="Cartas Elite"
                cards={eliteCards}
                gameState={gameState}
                type="elite"
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CardsScreen;
