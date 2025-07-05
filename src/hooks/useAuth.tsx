
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session first
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Initial session:', session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setSession(null);
      }
      return { error };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

  // Extract wallet information from user metadata
  const getWalletInfo = () => {
    if (!user) return null;
    
    const isWalletUser = user.user_metadata?.is_wallet_user || user.email?.includes('@telegramwallet.com') || false;
    const walletAddress = user.user_metadata?.wallet_address || user.user_metadata?.telegram_id || null;
    const username = user.user_metadata?.username || `User_${user.id.slice(-8)}`;
    
    return {
      address: walletAddress,
      username,
      isWalletUser
    };
  };

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user,
    walletInfo: getWalletInfo()
  };
};
