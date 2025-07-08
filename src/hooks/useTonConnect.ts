import { useEffect, useState, useCallback } from 'react';
import { TonConnectUI } from '@tonconnect/ui';

const MANIFEST_URL = 'https://bit-rush-galaxy-core.lovable.app/tonconnect-manifest.json';

export function useTonConnect() {
  const [tonConnectUI, setTonConnectUI] = useState<TonConnectUI | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('Initializing TON Connect...');
    
    const tc = new TonConnectUI({ 
      manifestUrl: MANIFEST_URL,
      // No usar buttonRootId para evitar el botón automático
      // buttonRootId: 'ton-connect-button'
    });
    
    setTonConnectUI(tc);

    // Listen for connection changes
    const unsubscribe = tc.onStatusChange(walletInfo => {
      console.log('Wallet status changed:', walletInfo);
      if (walletInfo && walletInfo.account) {
        console.log('Wallet connected:', walletInfo.account.address);
        setAddress(walletInfo.account.address);
      } else {
        console.log('Wallet disconnected');
        setAddress(null);
      }
    });

    // Check initial connection status
    const checkInitialStatus = async () => {
      try {
        const walletInfo = await tc.wallet;
        console.log('Initial wallet status:', walletInfo);
        if (walletInfo && walletInfo.account) {
          setAddress(walletInfo.account.address);
        }
      } catch (error) {
        console.log('No initial wallet connection');
      } finally {
        setIsInitialized(true);
      }
    };

    checkInitialStatus();

    return () => {
      unsubscribe();
    };
  }, []);

  const connect = useCallback(async () => {
    if (!tonConnectUI) return;
    setConnecting(true);
    try {
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Error opening modal:', error);
    } finally {
      setConnecting(false);
    }
  }, [tonConnectUI]);

  const disconnect = useCallback(async () => {
    if (!tonConnectUI) return;
    try {
      await tonConnectUI.disconnect();
      setAddress(null);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }, [tonConnectUI]);

  return {
    connect,
    disconnect,
    address,
    connecting,
    isConnected: !!address,
    isInitialized
  };
} 