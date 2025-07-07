import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AuthPage: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    authenticate, 
    logout, 
    connect, 
    disconnect, 
    address, 
    isConnected 
  } = useAuth();

  const handleAuthenticate = async () => {
    if (!address || !isConnected) return;
    
    try {
      await authenticate(address);
      // El contexto maneja automáticamente el estado de autenticación
    } catch (error) {
      // El contexto maneja el toast de error
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-cyan-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-cyan-400 flex items-center justify-center gap-2">
            <Wallet className="h-8 w-8" />
            Bit Rush Galaxy
          </CardTitle>
          <CardDescription className="text-gray-400">
            Conecta y autentica tu wallet TON para empezar a minar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isConnected ? (
            <div className="space-y-4">
              <div className="text-center text-gray-300 text-sm">
                <p>Para acceder al juego, conecta tu wallet oficial de TON</p>
                <p className="text-xs text-gray-500 mt-2">
                  (Solo wallets oficiales: Tonkeeper, MyTonWallet, Telegram, etc.)
                </p>
              </div>
              <Button
                onClick={connect}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Conectar Wallet TON
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-green-400 text-sm mb-2">✅ Wallet conectada</p>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Dirección de wallet:</p>
                  <p className="text-xs text-cyan-400 font-mono break-all">
                    {address}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center text-cyan-400 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Verificando wallet...
                  </div>
                ) : isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="text-center text-green-400 text-sm">
                      ✅ Wallet autenticada
                    </div>
                    <div className="text-center text-cyan-400 text-sm">
                      ¡Redirigiendo al juego...
                    </div>
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={handleAuthenticate}
                      className="w-full bg-green-600 hover:bg-green-500 text-white"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Autenticar Wallet
                    </Button>
                    <Button
                      onClick={disconnect}
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Desconectar wallet
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 text-center">
            <p>Bit Rush utiliza autenticación segura con firma de mensajes</p>
            <p>para verificar la propiedad de tu wallet TON</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
