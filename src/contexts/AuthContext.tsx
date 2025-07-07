import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  address: string;
  username: string;
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticate: (address: string) => Promise<void>;
  logout: () => void;
  connect: () => void;
  disconnect: () => void;
  address: string | null;
  isConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, connect, disconnect } = useTonConnect();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('bitrush_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('bitrush_user');
        }
      }
    };

    checkAuth();
  }, []);

  const authenticate = async (address: string) => {
    setIsLoading(true);
    
    try {
      // Generar mensaje único para firmar
      const timestamp = Date.now();
      const nonce = Math.random().toString(36).substring(2, 15);
      const message = `Bit Rush Galaxy Authentication\n\nWallet: ${address}\nTimestamp: ${timestamp}\nNonce: ${nonce}\n\nSign this message to authenticate your wallet.`;

      console.log('Message to sign:', message);

      // Simular autenticación exitosa
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Crear usuario simulado
      const userData: User = {
        id: `user_${address.slice(-8)}`,
        address: address,
        username: `User_${address.slice(-8)}`,
        isAuthenticated: true,
      };

      // Guardar en localStorage
      localStorage.setItem('bitrush_user', JSON.stringify(userData));
      setUser(userData);

      toast({
        title: '¡Autenticación exitosa!',
        description: 'Tu wallet ha sido verificada correctamente',
      });

    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: 'Error de autenticación',
        description: error.message || 'Ocurrió un error durante la autenticación',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('bitrush_user');
    setUser(null);
    disconnect();
    
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente',
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    authenticate,
    logout,
    connect,
    disconnect,
    address,
    isConnected,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 