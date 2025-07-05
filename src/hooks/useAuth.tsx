
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
    }
    return { error };
  };

  // Extract wallet information from user metadata
  const getWalletInfo = () => {
    if (!user) return null;
    
    return {
      address: user.user_metadata?.wallet_address || user.user_metadata?.telegram_id || null,
      username: user.user_metadata?.username || `User_${user.id.slice(-8)}`,
      isWalletUser: user.email?.includes('@telegram-wallet.local') || false
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
