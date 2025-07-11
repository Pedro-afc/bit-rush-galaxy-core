
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Copy, Users, Gift, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReferralsScreenProps {
  gameState: any;
}

const ReferralsScreen: React.FC<ReferralsScreenProps> = ({ gameState }) => {
  const { toast } = useToast();

  const referralLink = `https://t.me/Bitrushh_bot?start=${gameState.user?.referral_code || 'DEMO123'}`;
  
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "¡Enlace copiado!",
      description: "El enlace de referido se ha copiado al portapapeles",
    });
  };

  const referralRewards = [
    { requirement: '1 referido', reward: '5 giros + 1000 monedas', icon: '🎯' },
    { requirement: '5 referidos', reward: '15 giros + 5000 monedas', icon: '🔥' },
    { requirement: '10 referidos', reward: '30 giros + 10000 monedas', icon: '💎' },
    { requirement: '25 referidos', reward: '75 giros + 25000 monedas', icon: '👑' },
    { requirement: '50 referidos', reward: '150 giros + 50000 monedas', icon: '🏆' },
  ];

  // Get actual referrals from gameState
  const actualReferrals = gameState.referrals || [];

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-gray-800 p-3 sm:p-4 space-y-4 sm:space-y-6 overflow-y-auto">
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Sistema de Referidos</h1>
        <p className="text-gray-400 text-xs sm:text-sm">Invita a tus amigos y gana increíbles recompensas</p>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card className="bg-gray-800/50 border-cyan-500/20">
          <CardContent className="p-3 sm:p-4 text-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-white">{actualReferrals.length}</div>
            <div className="text-xs sm:text-sm text-cyan-400">Referidos Totales</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-green-500/20">
          <CardContent className="p-3 sm:p-4 text-center">
            <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-white">{actualReferrals.filter(r => r.reward_claimed).length}</div>
            <div className="text-xs sm:text-sm text-green-400">Recompensas Reclamadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card className="bg-gray-800/50 border-purple-500/20">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2">
            <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
            Tu Enlace de Referido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-3 sm:p-6 pt-0">
          <div className="flex gap-2">
            <Input 
              value={referralLink}
              readOnly
              className="bg-gray-700 border-gray-600 text-white text-xs sm:text-sm"
            />
            <Button 
              onClick={copyReferralLink}
              size="icon"
              className="bg-purple-600 hover:bg-purple-500 flex-shrink-0"
            >
              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-gray-400">
            Comparte este enlace con tus amigos para que se unan a Bit Rush
          </p>
        </CardContent>
      </Card>

      {/* Referral Rewards */}
      <Card className="bg-gray-800/50 border-yellow-500/20">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-white text-base sm:text-lg">Recompensas por Referidos</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="space-y-2 sm:space-y-3">
            {referralRewards.map((reward, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 sm:p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-lg sm:text-2xl">{reward.icon}</span>
                  <div>
                    <div className="text-white font-bold text-sm sm:text-base">{reward.requirement}</div>
                    <div className="text-xs sm:text-sm text-gray-400">{reward.reward}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {actualReferrals.length >= parseInt(reward.requirement) ? '✅' : '⏳'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referred Users List */}
      <Card className="bg-gray-800/50 border-blue-500/20">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-white text-base sm:text-lg">Tus Referidos</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {actualReferrals.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {actualReferrals.map((referral, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 sm:p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
                >
                  <div>
                    <div className="text-white font-bold text-sm sm:text-base">Usuario {index + 1}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Se unió: {new Date(referral.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-xs sm:text-sm">
                    {referral.reward_claimed ? (
                      <span className="text-green-400">✅ Recompensa reclamada</span>
                    ) : (
                      <Button size="sm" className="bg-green-600 hover:bg-green-500 text-xs px-2 py-1">
                        Reclamar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 sm:py-6 text-gray-400">
              <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm sm:text-base">Aún no tienes referidos</p>
              <p className="text-xs sm:text-sm">¡Invita a tus amigos para empezar a ganar!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Guide - Improved background */}
      <Card className="bg-gray-800/80 border-purple-500/30 backdrop-blur-sm">
        <CardContent className="p-3 sm:p-4">
          <h3 className="text-white font-bold mb-2 text-sm sm:text-base">📋 Guía Rápida</h3>
          <ul className="text-xs sm:text-sm text-gray-200 space-y-1">
            <li>• Copia tu enlace de referido</li>
            <li>• Compártelo con tus amigos</li>
            <li>• Gana recompensas cuando se unan</li>
            <li>• ¡Más referidos = más giros y monedas!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralsScreen;
