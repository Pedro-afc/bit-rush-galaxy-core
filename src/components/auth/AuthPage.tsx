
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Loader2 } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        onAuthSuccess();
      }
    };
    checkUser();
  }, [onAuthSuccess]);

  const generateMockWalletAddress = () => {
    // Generate a mock TON wallet address (more realistic format)
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let address = 'UQ';
    for (let i = 0; i < 46; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  };

  const handleConnectWallet = async () => {
    setIsLoading(true);

    try {
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAddress = generateMockWalletAddress();
      setWalletAddress(mockAddress);

      // Create a valid email format for Supabase using a standard domain
      const uniqueId = mockAddress.slice(-12).toLowerCase(); // Use last 12 chars for uniqueness
      const walletEmail = `wallet${uniqueId}@telegramwallet.com`; // Changed to valid domain
      const walletPassword = `wallet_${mockAddress.slice(-16)}`; // Use last 16 chars as password

      console.log('Attempting authentication with:', walletEmail);

      // Try to sign in first, if it fails, sign up
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: walletPassword,
      });

      if (signInError && signInError.message.includes('Invalid login credentials')) {
        // User doesn't exist, create new account
        console.log('Creating new user account...');
        const { error: signUpError } = await supabase.auth.signUp({
          email: walletEmail,
          password: walletPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: `User_${mockAddress.slice(-8)}`,
              telegram_id: mockAddress,
              wallet_address: mockAddress,
              is_wallet_user: true
            }
          }
        });

        if (signUpError) {
          console.error('Signup error:', signUpError);
          toast({
            title: "Error de registro",
            description: signUpError.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "¡Wallet conectada!",
            description: "Tu wallet de Telegram se ha conectado exitosamente"
          });
          // Small delay to ensure auth state is updated
          setTimeout(() => {
            onAuthSuccess();
          }, 1000);
        }
      } else if (signInError) {
        console.error('Signin error:', signInError);
        toast({
          title: "Error de conexión",
          description: signInError.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "¡Bienvenido de vuelta!",
          description: "Tu wallet de Telegram se ha conectado exitosamente"
        });
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          onAuthSuccess();
        }, 1000);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al conectar la wallet",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-cyan-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-cyan-400 flex items-center justify-center gap-2">
            <Wallet className="h-8 w-8" />
            Bit Rush
          </CardTitle>
          <CardDescription className="text-gray-400">
            Conecta tu wallet de Telegram para empezar a minar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!walletAddress ? (
            <div className="space-y-4">
              <div className="text-center text-gray-300 text-sm">
                <p>Para acceder al juego, conecta tu wallet de Telegram</p>
                <p className="text-xs text-gray-500 mt-2">
                  (Versión de prueba - se generará una wallet simulada)
                </p>
              </div>
              
              <Button
                onClick={handleConnectWallet}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando wallet...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Conectar Wallet de Telegram
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
                    {walletAddress}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    console.log('Entering game...');
                    onAuthSuccess();
                  }}
                  className="w-full bg-green-600 hover:bg-green-500"
                >
                  Entrar al juego
                </Button>
                
                <Button
                  onClick={handleDisconnectWallet}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Desconectar wallet
                </Button>
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
