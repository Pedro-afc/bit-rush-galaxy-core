import { useState, useEffect, useCallback } from 'react';
import { useTonConnect } from './useTonConnect';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface User {
  id: string;
  telegram_id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export function useWalletAuth() {
  const { address, isConnected, connect, disconnect } = useTonConnect();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Verificar si el usuario ya está autenticado al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        // Obtener datos adicionales del usuario
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        if (profile) {
          setUser({
            id: currentUser.id,
            telegram_id: profile.telegram_id,
            username: profile.username,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          });
        }
      }
    };

    checkAuth();
  }, []);

  // Función para generar un mensaje único para firmar
  const generateAuthMessage = useCallback((address: string) => {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    return `Bit Rush Galaxy Authentication\n\nWallet: ${address}\nTimestamp: ${timestamp}\nNonce: ${nonce}\n\nSign this message to authenticate your wallet.`;
  }, []);

  // Función para autenticar con firma
  const authenticateWithSignature = useCallback(async (address: string, signature: string, message: string) => {
    try {
      // Enviar la firma al backend para verificación
      const response = await fetch('/api/auth/verify-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          signature,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify signature');
      }

      const { token } = await response.json();
      
      // Establecer el token en Supabase
      const { data, error } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: token,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }, []);

  // Función principal de login
  const login = useCallback(async () => {
    if (!address || !isConnected) {
      toast({
        title: 'Error',
        description: 'Por favor conecta tu wallet primero',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      // Generar mensaje para firmar
      const message = generateAuthMessage(address);
      
      // Por ahora, simulamos la firma (en producción usarías TON Connect)
      console.log('Message to sign:', message);
      
      // Simular firma exitosa (reemplazar con implementación real)
      const signature = 'simulated_signature_' + Date.now();

      // Autenticar con la firma
      const authData = await authenticateWithSignature(address, signature, message);

      // Obtener datos del usuario del response
      const response = await fetch('/api/auth/verify-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, message }),
      });
      
      const { user: userData } = await response.json();

      setUser({
        id: userData.id,
        telegram_id: userData.telegram_id,
        username: userData.username,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      });

      toast({
        title: '¡Autenticación exitosa!',
        description: 'Tu wallet ha sido verificada correctamente',
      });

    } catch (error: any) {
      console.error('Login error:', error);
      setAuthError(error.message);
      toast({
        title: 'Error de autenticación',
        description: error.message || 'Ocurrió un error durante la autenticación',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, generateAuthMessage, authenticateWithSignature, toast]);

  // Función de logout
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAuthError(null);
      disconnect();
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [disconnect, toast]);

  return {
    user,
    loading,
    authError,
    login,
    logout,
    connect,
    disconnect,
    address,
    isConnected,
    isAuthenticated: !!user,
  };
} 