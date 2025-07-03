
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Star, Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShopScreenProps {
  gameState: any;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ gameState }) => {
  const { toast } = useToast();

  const purchaseItem = async (item: any) => {
    const { stats } = gameState;
    
    // Check if item is on timer
    if (item.unlock_timer && new Date() < new Date(item.unlock_timer)) {
      toast({
        title: "Artículo no disponible",
        description: "Este artículo está en cooldown",
        variant: "destructive"
      });
      return;
    }

    // Check if user has enough currency
    if (item.current_price_stars && stats.stars < item.current_price_stars) {
      toast({
        title: "Fondos insuficientes",
        description: "No tienes suficientes estrellas",
        variant: "destructive"
      });
      return;
    }

    if (item.current_price_ton && stats.ton_balance < item.current_price_ton) {
      toast({
        title: "Fondos insuficientes",
        description: "No tienes suficiente TON",
        variant: "destructive"
      });
      return;
    }

    try {
      let unlockTime = null;
      
      // Set timer for specific items
      if (item.item_name === '1000 Coins') {
        unlockTime = new Date();
        unlockTime.setHours(unlockTime.getHours() + 12); // 12 hour cooldown
      }

      // Calculate new prices (10% increase)
      let newPriceStars = item.current_price_stars;
      let newPriceTon = item.current_price_ton;
      
      if (item.current_price_stars) {
        newPriceStars = Math.floor(item.current_price_stars * 1.1);
      }
      if (item.current_price_ton) {
        newPriceTon = (item.current_price_ton * 1.1).toFixed(1);
      }

      // Update shop item
      await supabase
        .from('shop_items')
        .update({
          current_price_stars: newPriceStars,
          current_price_ton: newPriceTon,
          purchase_count: item.purchase_count + 1,
          unlock_timer: unlockTime?.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      // Update user stats
      const updates: any = {
        updated_at: new Date().toISOString()
      };

      if (item.current_price_stars) {
        updates.stars = stats.stars - item.current_price_stars;
      }
      if (item.current_price_ton) {
        updates.ton_balance = stats.ton_balance - item.current_price_ton;
      }

      // Add item benefits
      switch (item.item_type) {
        case 'coins':
          updates.coins = stats.coins + 1000;
          break;
        case 'booster':
          updates.energy = Math.min(stats.max_energy, stats.energy + 50);
          break;
        case 'pack':
          updates.spins = stats.spins + 3;
          updates.stars = (updates.stars || stats.stars) + 10;
          break;
      }

      await supabase
        .from('stats')
        .update(updates)
        .eq('user_id', gameState.user.id);

      toast({
        title: "¡Compra exitosa!",
        description: `Has comprado ${item.item_name}`,
      });

      // Update local state
      item.current_price_stars = newPriceStars;
      item.current_price_ton = newPriceTon;
      item.purchase_count += 1;
      item.unlock_timer = unlockTime?.toISOString();
      Object.assign(gameState.stats, updates);

    } catch (error) {
      console.error('Error purchasing item:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la compra",
        variant: "destructive"
      });
    }
  };

  const isItemOnTimer = (item: any) => {
    if (!item.unlock_timer) return false;
    return new Date() < new Date(item.unlock_timer);
  };

  const getItemDescription = (item: any) => {
    switch (item.item_type) {
      case 'coins': return 'Recibe 1000 monedas instantáneamente';
      case 'booster': return 'Restaura 50 puntos de energía';
      case 'pack': return 'Recibe 3 giros + 10 estrellas';
      default: return 'Artículo especial de la tienda';
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Tienda</h1>
        <p className="text-gray-400 text-sm">Compra artículos especiales para potenciar tu progreso</p>
      </div>

      {/* Player Currency Display */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-gray-800/50 border-green-500/20">
          <CardContent className="p-3 text-center">
            <Coins className="h-5 w-5 text-green-400 mx-auto mb-1" />
            <div className="text-sm text-green-400">Monedas</div>
            <div className="text-white font-bold">{gameState.stats.coins.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-pink-500/20">
          <CardContent className="p-3 text-center">
            <Star className="h-5 w-5 text-pink-400 mx-auto mb-1" />
            <div className="text-sm text-pink-400">Estrellas</div>
            <div className="text-white font-bold">{gameState.stats.stars}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-yellow-500/20">
          <CardContent className="p-3 text-center">
            <div className="text-sm text-yellow-400 font-bold mb-1">TON</div>
            <div className="text-white font-bold">{gameState.stats.ton_balance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Shop Items */}
      <div className="space-y-4">
        {gameState.shopItems.map((item: any, index: number) => {
          const onTimer = isItemOnTimer(item);
          
          return (
            <Card key={index} className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center justify-between">
                  <span>{item.item_name}</span>
                  <span className="text-sm text-gray-400">#{item.purchase_count} compras</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-400 text-sm">{getItemDescription(item)}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {item.current_price_stars && (
                      <div className="flex items-center gap-1 text-pink-400">
                        <Star className="h-4 w-4" />
                        <span className="font-bold">{item.current_price_stars}</span>
                      </div>
                    )}
                    {item.current_price_ton && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <span className="font-bold">TON</span>
                        <span className="font-bold">{item.current_price_ton}</span>
                      </div>
                    )}
                  </div>
                  
                  {onTimer ? (
                    <div className="flex items-center gap-2 text-orange-400 text-sm">
                      <Timer className="h-4 w-4" />
                      <span>12h restantes</span>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => purchaseItem(item)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                    >
                      Comprar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ShopScreen;
