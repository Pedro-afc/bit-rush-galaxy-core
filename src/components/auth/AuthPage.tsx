import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTonConnect } from '@/hooks/useTonConnect';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const { toast } = useToast();
  const { connect, disconnect, address, connecting, isConnected } = useTonConnect();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const tryLogin = async () => {
      if (!address || isProcessing) return;
      
      setIsProcessing(true);
      console.log('Attempting login with address:', address);
      
      try {
        // Usar la address real como email único
        const walletEmail = `wallet${address.toLowerCase()}@telegramwallet.com`;
        const walletPassword = `wallet_${address.slice(-16)}`;

        console.log('Using email:', walletEmail);

        // Intentar login o registro
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: walletEmail,
          password: walletPassword,
        });

        if (signInError && signInError.message.includes('Invalid login credentials')) {
          console.log('User not found, creating new account...');
          // Registrar usuario
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: walletEmail,
            password: walletPassword,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                username: `User_${address.slice(-8)}`,
                telegram_id: address,
                wallet_address: address,
                is_wallet_user: true
              }
            }
          });
          
          if (signUpError) {
            console.error('Signup error:', signUpError);
            toast({
              title: 'Error de registro',
              description: signUpError.message,
              variant: 'destructive'
            });
          } else if (data.user) {
            console.log('User created successfully');
            toast({
              title: '¡Wallet conectada!',
              description: 'Tu wallet TON se ha conectado exitosamente'
            });
            setTimeout(() => onAuthSuccess(), 1500);
          }
        } else if (signInError) {
          console.error('Signin error:', signInError);
          toast({
            title: 'Error de conexión',
            description: signInError.message,
            variant: 'destructive'
          });
        } else {
          console.log('User signed in successfully');
          toast({
            title: '¡Bienvenido de vuelta!',
            description: 'Tu wallet TON se ha conectado exitosamente'
          });
          setTimeout(() => onAuthSuccess(), 1500);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          title: 'Error inesperado',
          description: 'Ocurrió un error durante la conexión',
          variant: 'destructive'
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    if (isConnected && address) {
      tryLogin();
    }
  }, [isConnected, address, onAuthSuccess, toast, isProcessing]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-cyan-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-cyan-400 flex items-center justify-center gap-2">
            <Wallet className="h-8 w-8" />
            Bit Rush
          </CardTitle>
          <CardDescription className="text-gray-400">
            Conecta tu wallet TON para empezar a minar
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
                disabled={connecting}
              >
                {connecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando wallet...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Conectar Wallet TON
                  </>
                )}
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
                {isProcessing ? (
                  <div className="text-center text-cyan-400 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Iniciando juego...
                  </div>
                ) : (
                  <Button
                    onClick={disconnect}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Desconectar wallet
                  </Button>
                )}
              </div>
            </div>
          )}
          <div className="text-xs text-gray-500 text-center">
            <p>Bit Rush utiliza la blockchain de TON</p>
            <p>para transacciones seguras y descentralizadas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
