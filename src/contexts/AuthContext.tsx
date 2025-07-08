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
          
          // Verificar si el ID es un UUID válido
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(userData.id)) {
            console.log('Invalid user ID found, clearing localStorage');
            localStorage.removeItem('bitrush_user');
            setUser(null);
          } else {
            setUser(userData);
            // Intentar autenticar con Supabase si hay usuario guardado
            if (userData.address) {
              console.log('Attempting Supabase authentication for saved user');
              authenticateWithSupabase(userData.address);
            }
          }
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

  // Función separada para autenticar con Supabase
  const authenticateWithSupabase = async (address: string) => {
    try {
      console.log('Authenticating with Supabase for address:', address);

      // Generar email y password válidos para Supabase
      const emailHash = btoa(address).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
      const email = `${emailHash}@bitrush.game`;
      const password = `ton_${emailHash}`; // Password fijo para consistencia

      console.log('Generated credentials:', { email, password });

      // Intentar iniciar sesión primero
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Supabase signIn attempt:', { authData, authError });

      if (authError) {
        // Si no existe el usuario, crearlo
        if (authError.message.includes('Invalid login credentials')) {
          console.log('User does not exist, creating new user...');
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                wallet_address: address,
                username: `User_${address.slice(-8)}`
              }
            }
          });

          console.log('Supabase signUp attempt:', { signUpData, signUpError });

          if (signUpError) {
            console.error('Error creating Supabase user:', signUpError);
            console.log('Continuing with local authentication only');
          } else {
            console.log('Supabase user created successfully:', signUpData);
            
            // Intentar iniciar sesión después de crear el usuario
            const { data: retryAuthData, error: retryAuthError } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            console.log('Retry signIn after signUp:', { retryAuthData, retryAuthError });
          }
        } else {
          console.error('Supabase auth error:', authError);
        }
      } else {
        console.log('Supabase auth successful:', authData);
      }

      // Verificar sesión después de la autenticación
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session after authentication:', { session, sessionError });

    } catch (error) {
      console.error('Error in Supabase authentication:', error);
    }
  };

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

      // Autenticar con Supabase
      await authenticateWithSupabase(address);

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
      
      // Cerrar sesión de Supabase
      supabase.auth.signOut();
      
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