
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Calendar, Users, Trophy, Star, Gift } from 'lucide-react';

interface AirdropInfoProps {
  gameState: any;
}

const AirdropInfo: React.FC<AirdropInfoProps> = ({ gameState }) => {
  const userLevel = gameState?.stats?.level || 1;
  const userCoins = gameState?.stats?.coins || 0;
  const referralCount = 0; // This would come from referrals data

  const airdropRequirements = [
    { icon: Trophy, label: 'Nivel 10+', current: userLevel, target: 10, color: 'text-yellow-400' },
    { icon: Coins, label: '100K Monedas', current: userCoins, target: 100000, color: 'text-green-400' },
    { icon: Users, label: '5 Referidos', current: referralCount, target: 5, color: 'text-blue-400' },
  ];

  const calculateProgress = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100);
  };

  const isQualified = airdropRequirements.every(req => req.current >= req.target);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Gift className="h-12 w-12 text-purple-400" />
          </div>
          <CardTitle className="text-2xl text-purple-400 mb-2">
            🚀 Próximo Airdrop
          </CardTitle>
          <p className="text-gray-300 text-sm">
            Prepárate para el mayor evento de recompensas de Bit Rush
          </p>
        </CardHeader>
      </Card>

      {/* Countdown */}
      <Card className="bg-gray-800/30 border-cyan-500/30">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-cyan-400" />
            <span className="text-cyan-400 font-bold">Fecha Estimada</span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            Q2 2025
          </div>
          <p className="text-gray-400 text-sm">
            Mantente activo para calificar
          </p>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card className="bg-gray-800/30 border-gray-600/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Requisitos para Calificar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {airdropRequirements.map((req, index) => {
            const progress = calculateProgress(req.current, req.target);
            const isComplete = req.current >= req.target;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <req.icon className={`h-4 w-4 ${req.color}`} />
                    <span className="text-white text-sm">{req.label}</span>
                    {isComplete && <span className="text-green-400 text-xs">✓</span>}
                  </div>
                  <span className="text-gray-400 text-sm">
                    {req.current.toLocaleString()} / {req.target.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Status */}
      <Card className={`${
        isQualified 
          ? 'bg-green-900/30 border-green-500/50' 
          : 'bg-orange-900/30 border-orange-500/50'
      }`}>
        <CardContent className="p-6 text-center">
          <div className={`text-6xl mb-4 ${isQualified ? 'text-green-400' : 'text-orange-400'}`}>
            {isQualified ? '🎉' : '⏳'}
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isQualified ? 'text-green-400' : 'text-orange-400'}`}>
            {isQualified ? '¡Calificado!' : 'En Progreso'}
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            {isQualified 
              ? 'Felicidades, cumples todos los requisitos para el airdrop'
              : 'Continúa jugando para cumplir todos los requisitos'
            }
          </p>
        </CardContent>
      </Card>

      {/* Rewards Preview */}
      <Card className="bg-gray-800/30 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Recompensas Estimadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl">🪙</div>
              <div className="text-yellow-400 font-bold">1M+ Monedas</div>
              <div className="text-gray-400 text-xs">Bonus por nivel</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">💎</div>
              <div className="text-purple-400 font-bold">100+ TON</div>
              <div className="text-gray-400 text-xs">Tokens premium</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">⭐</div>
              <div className="text-cyan-400 font-bold">1000+ Estrellas</div>
              <div className="text-gray-400 text-xs">Telegram Stars</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🎁</div>
              <div className="text-pink-400 font-bold">NFT Exclusivo</div>
              <div className="text-gray-400 text-xs">Coleccionable único</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-500/50">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-cyan-400 mb-2">
            ¡No te quedes fuera!
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            Sigue jugando diariamente, mejora tus cartas y refiere amigos para asegurar tu lugar en el airdrop más grande de Bit Rush.
          </p>
          <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
            Continuar Jugando
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AirdropInfo;
