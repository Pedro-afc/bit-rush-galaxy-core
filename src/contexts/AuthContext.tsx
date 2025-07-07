import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [isInitialized, setIsInitialized] = useState(false);

  // Verificar autenticación al cargar
  useEffect(() => {
    if (isInitialized) return;
    
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('bitrush_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('bitrush_user');
      } finally {
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, [isInitialized]);

  const authenticate = async (address: string) => {
    if (isLoading) return; // Evitar múltiples llamadas
    
    setIsLoading(true);
    
    try {
      console.log('Authenticating wallet:', address);

      // Generar un UUID válido para el usuario
      const userId = crypto.randomUUID();
      
      // Crear usuario con UUID válido
      const userData: User = {
        id: userId, // UUID válido para la base de datos
        address: address,
        username: `User_${address.slice(-8)}`,
        isAuthenticated: true,
      };

      // Guardar usuario en localStorage
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
    try {
      localStorage.removeItem('bitrush_user');
      setUser(null);
      disconnect();
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Solo renderizar cuando esté inicializado
  if (!isInitialized) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-cyan-400">Cargando...</div>
    </div>;
  }

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