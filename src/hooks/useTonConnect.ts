import { useEffect, useState, useCallback } from 'react';
import { TonConnectUI } from '@tonconnect/ui';

const MANIFEST_URL = '/tonconnect-manifest.json';

export function useTonConnect() {
  const [tonConnectUI, setTonConnectUI] = useState<TonConnectUI | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const tc = new TonConnectUI({ 
      manifestUrl: MANIFEST_URL,
      buttonRootId: 'ton-connect-button'
    });
    
    setTonConnectUI(tc);

    // Listen for connection changes
    const unsubscribe = tc.onStatusChange(walletInfo => {
      console.log('Wallet status changed:', walletInfo);
      if (walletInfo && walletInfo.account) {
        setAddress(walletInfo.account.address);
      } else {
        setAddress(null);
      }
    });

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
    isConnected: !!address
  };
} 