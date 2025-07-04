import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Star, Timer, Package, Zap, Pickaxe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShopScreenProps {
  gameState: any;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ gameState }) => {
  const { toast } = useToast();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const shopPacks = [
    {
      id: 'basic_pack',
      name: 'Paquete Básico',
      description: 'Perfecto para comenzar tu aventura',
      icon: '📦',
      price_coins: 5000,
      items: [
        { type: 'spins', amount: 3, icon: '🎰' },
        { type: 'mining_rate', amount: 5, icon: '⛏️' }
      ],
      popular: false
    },
    {
      id: 'premium_pack',
      name: 'Paquete Premium',
      description: 'La mejor relación calidad-precio',
      icon: '🎁',
      price_stars: 25,
      items: [
        { type: 'spins', amount: 10, icon: '🎰' },
        { type: 'coins', amount: 15000, icon: '💰' },
        { type: 'mining_rate', amount: 15, icon: '⛏️' }
      ],
      popular: true
    },
    {
      id: 'elite_pack',
      name: 'Paquete Élite',
      description: 'Para los jugadores más exigentes',
      icon: '👑',
      price_ton: 0.5,
      items: [
        { type: 'spins', amount: 25, icon: '🎰' },
        { type: 'coins', amount: 50000, icon: '💰' },
        { type: 'stars', amount: 50, icon: '⭐' },
        { type: 'mining_rate', amount: 30, icon: '⛏️' }
      ],
      popular: false
    }
  ];

  const individualItems = [
    {
      id: 'coins_1k',
      name: '1,000 Monedas',
      description: 'Monedas instantáneas',
      icon: '💰',
      price_stars: 5,
      cooldown: 1, // 1 hour
      reward: { type: 'coins', amount: 1000 }
    },
    {
      id: 'mining_boost_small',
      name: 'Boost Minería +5',
      description: 'Aumenta tu tasa de minería permanentemente',
      icon: '⛏️',
      price_coins: 3000,
      cooldown: 2, // 2 hours
      reward: { type: 'mining_rate', amount: 5 }
    },
    {
      id: 'mining_boost_medium',
      name: 'Boost Minería +15',
      description: 'Gran aumento de minería permanente',
      icon: '⚡',
      price_stars: 20,
      cooldown: 4, // 4 hours
      reward: { type: 'mining_rate', amount: 15 }
    },
    {
      id: 'spin_pack',
      name: 'Pack de Giros',
      description: '5 giros para la ruleta',
      icon: '🎰',
      price_stars: 15,
      cooldown: 6, // 6 hours
      reward: { type: 'spins', amount: 5 }
    },
    {
      id: 'mining_boost_large',
      name: 'Boost Minería +50',
      description: 'Aumento masivo de minería permanente',
      icon: '💎',
      price_ton: 0.2,
      cooldown: 8, // 8 hours
      reward: { type: 'mining_rate', amount: 50 }
    },
    {
      id: 'mega_coins',
      name: '10,000 Monedas',
      description: 'Gran cantidad de monedas',
      icon: '💰',
      price_ton: 0.1,
      cooldown: 12, // 12 hours
      reward: { type: 'coins', amount: 10000 }
    }
  ];

  const purchaseItem = async (item: any, isPack: boolean = false) => {
    if (purchasing) return;
    
    setPurchasing(item.id);
    
    try {
      const { stats } = gameState;
      
      // Check if user has enough currency
      if (item.price_coins && stats.coins < item.price_coins) {
        toast({
          title: "Fondos insuficientes",
          description: "No tienes suficientes monedas",
          variant: "destructive"
        });
        return;
      }

      if (item.price_stars && stats.stars < item.price_stars) {
        toast({
          title: "Fondos insuficientes",
          description: "No tienes suficientes estrellas",
          variant: "destructive"
        });
        return;
      }

      if (item.price_ton && stats.ton_balance < item.price_ton) {
        toast({
          title: "Fondos insuficientes",
          description: "No tienes suficiente TON",
          variant: "destructive"
        });
        return;
      }

      // Calculate updates
      const updates: any = {
        updated_at: new Date().toISOString()
      };

      // Deduct payment
      if (item.price_coins) {
        updates.coins = stats.coins - item.price_coins;
      }
      if (item.price_stars) {
        updates.stars = stats.stars - item.price_stars;
      }
      if (item.price_ton) {
        updates.ton_balance = stats.ton_balance - item.price_ton;
      }

      // Add rewards
      if (isPack) {
        // Handle pack items
        item.items.forEach((packItem: any) => {
          switch (packItem.type) {
            case 'coins':
              updates.coins = (updates.coins !== undefined ? updates.coins : stats.coins) + packItem.amount;
              break;
            case 'spins':
              updates.spins = (updates.spins !== undefined ? updates.spins : stats.spins) + packItem.amount;
              break;
            case 'stars':
              updates.stars = (updates.stars !== undefined ? updates.stars : stats.stars) + packItem.amount;
              break;
            case 'mining_rate':
              updates.mining_rate = (updates.mining_rate !== undefined ? updates.mining_rate : stats.mining_rate) + packItem.amount;
              break;
          }
        });
      } else {
        // Handle individual item
        switch (item.reward.type) {
          case 'coins':
            updates.coins = (updates.coins !== undefined ? updates.coins : stats.coins) + item.reward.amount;
            break;
          case 'spins':
            updates.spins = (updates.spins !== undefined ? updates.spins : stats.spins) + item.reward.amount;
            break;
          case 'mining_rate':
            updates.mining_rate = (updates.mining_rate !== undefined ? updates.mining_rate : stats.mining_rate) + item.reward.amount;
            break;
        }
      }

      // Update database
      await supabase
        .from('stats')
        .update(updates)
        .eq('user_id', gameState.user.id);

      // Update local state
      Object.assign(gameState.stats, updates);

      toast({
        title: "¡Compra exitosa!",
        description: `Has comprado ${item.name}`,
      });

    } catch (error) {
      console.error('Error purchasing item:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la compra",
        variant: "destructive"
      });
    } finally {
      setPurchasing(null);
    }
  };

  const formatPrice = (item: any) => {
    if (item.price_coins) return `${item.price_coins.toLocaleString()} monedas`;
    if (item.price_stars) return `${item.price_stars} estrellas`;
    if (item.price_ton) return `${item.price_ton} TON`;
    return 'Gratis';
  };

  const getPriceIcon = (item: any) => {
    if (item.price_coins) return <Coins className="h-4 w-4 text-yellow-400" />;
    if (item.price_stars) return <Star className="h-4 w-4 text-pink-400" />;
    if (item.price_ton) return <div className="text-yellow-400 font-bold text-sm">TON</div>;
    return null;
  };

  const canAfford = (item: any) => {
    const { stats } = gameState;
    if (item.price_coins && stats.coins < item.price_coins) return false;
    if (item.price_stars && stats.stars < item.price_stars) return false;
    if (item.price_ton && stats.ton_balance < item.price_ton) return false;
    return true;
  };

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-gray-800 p-4 space-y-6 overflow-y-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Tienda</h1>
        <p className="text-gray-400 text-sm">Compra artículos especiales para potenciar tu progreso</p>
      </div>

      {/* Player Currency Display */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-green-500/20">
          <CardContent className="p-3 text-center">
            <Coins className="h-5 w-5 text-green-400 mx-auto mb-1" />
            <div className="text-sm text-green-400">Monedas</div>
            <div className="text-white font-bold text-sm">{gameState.stats.coins.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-pink-500/20">
          <CardContent className="p-3 text-center">
            <Star className="h-5 w-5 text-pink-400 mx-auto mb-1" />
            <div className="text-sm text-pink-400">Estrellas</div>
            <div className="text-white font-bold text-sm">{gameState.stats.stars}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-yellow-500/20">
          <CardContent className="p-3 text-center">
            <div className="text-sm text-yellow-400 font-bold mb-1">TON</div>
            <div className="text-white font-bold text-sm">{gameState.stats.ton_balance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Paquetes Especiales */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-purple-400" />
          Paquetes Especiales
        </h2>
        <div className="grid gap-4">
          {shopPacks.map((pack) => (
            <Card key={pack.id} className={`relative ${
              pack.popular ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/50' : 'bg-gray-800/50 border-gray-700'
            }`}>
              {pack.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1 rounded-full">
                  🔥 POPULAR
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <span className="text-2xl">{pack.icon}</span>
                  {pack.name}
                </CardTitle>
                <p className="text-gray-400 text-sm">{pack.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {pack.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-700/30 rounded p-2">
                      <span>{item.icon}</span>
                      <span className="text-white text-sm">+{item.amount}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPriceIcon(pack)}
                    <span className={`font-bold ${canAfford(pack) ? 'text-white' : 'text-red-400'}`}>
                      {formatPrice(pack)}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={() => purchaseItem(pack, true)}
                    disabled={!canAfford(pack) || purchasing === pack.id}
                    className={`${
                      pack.popular 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500' 
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
                    } disabled:opacity-50`}
                  >
                    {purchasing === pack.id ? 'Comprando...' : 'Comprar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Artículos Individuales */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Pickaxe className="h-5 w-5 text-cyan-400" />
          Artículos Individuales
        </h2>
        <div className="grid gap-4">
          {individualItems.map((item) => (
            <Card key={item.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className="text-white font-bold">{item.name}</h3>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                      <div className="flex items-center gap-1 text-xs text-orange-400 mt-1">
                        <Timer className="h-3 w-3" />
                        <span>Cooldown: {item.cooldown}h</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      {getPriceIcon(item)}
                      <span className={`font-bold ${canAfford(item) ? 'text-white' : 'text-red-400'}`}>
                        {formatPrice(item)}
                      </span>
                    </div>
                    <Button 
                      onClick={() => purchaseItem(item)}
                      disabled={!canAfford(item) || purchasing === item.id}
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50"
                    >
                      {purchasing === item.id ? 'Comprando...' : 'Comprar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopScreen;
