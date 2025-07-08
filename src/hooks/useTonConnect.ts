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
    
    // Limpiar cualquier estado previo
    setAddress(null);
    setConnecting(false);
    
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
    console.log('Connect function called');
    console.log('tonConnectUI state:', tonConnectUI);
    
    if (!tonConnectUI) {
      console.error('TON Connect UI not initialized');
      return;
    }
    
    setConnecting(true);
    console.log('Opening TON Connect modal...');
    
    try {
      // Limpiar cualquier conexión previa
      await tonConnectUI.disconnect();
      console.log('Previous connection cleared');
      
      // Esperar un momento antes de abrir el modal
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await tonConnectUI.openModal();
      console.log('Modal opened successfully');
    } catch (error) {
      console.error('Error opening modal:', error);
    } finally {
      setConnecting(false);
      console.log('Connect function completed');
    }
  }, [tonConnectUI]);

  const disconnect = useCallback(async () => {
    if (!tonConnectUI) return;
    try {
      await tonConnectUI.disconnect();
      setAddress(null);
      console.log('Wallet disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }, [tonConnectUI]);

  const resetConnection = useCallback(async () => {
    console.log('Resetting TON Connect connection...');
    if (tonConnectUI) {
      try {
        await tonConnectUI.disconnect();
        console.log('Connection reset completed');
      } catch (error) {
        console.error('Error resetting connection:', error);
      }
    }
    setAddress(null);
    setConnecting(false);
  }, [tonConnectUI]);

  return {
    connect,
    disconnect,
    resetConnection,
    address,
    connecting,
    isConnected: !!address,
    isInitialized
  };
} 