/**
 * Network Status Hook
 * 
 * Detects online/offline state and provides network connectivity information.
 * Automatically updates when network state changes.
 * 
 * Requirements:
 * - 12.1: Display cached data when device loses network connectivity
 * - 12.4: Automatically refresh data when connectivity is restored
 */

import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

export interface NetworkStatus {
  /** Whether the device is connected to the internet */
  isConnected: boolean;
  /** Whether the connection status is being determined */
  isLoading: boolean;
  /** The type of connection (wifi, cellular, etc.) */
  connectionType: string | null;
  /** Whether the connection is expensive (cellular data) */
  isExpensive: boolean;
  /** Manually refresh the network status */
  refresh: () => Promise<void>;
}

/**
 * Hook for monitoring network connectivity status.
 * Automatically subscribes to network state changes and updates accordingly.
 * 
 * @example
 * ```tsx
 * const { isConnected, isLoading, connectionType } = useNetworkStatus();
 * 
 * if (!isConnected) {
 *   return <OfflineIndicator />;
 * }
 * ```
 */
export function useNetworkStatus(): NetworkStatus {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isExpensive, setIsExpensive] = useState<boolean>(false);

  const updateNetworkState = useCallback((state: NetInfoState) => {
    // NetInfo returns null for isConnected when it can't determine the state
    // We default to true in that case to avoid false offline indicators
    setIsConnected(state.isConnected ?? true);
    setConnectionType(state.type);
    setIsExpensive(state.details?.isConnectionExpensive ?? false);
    setIsLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await NetInfo.fetch();
      updateNetworkState(state);
    } catch {
      // If we can't fetch network state, assume connected
      setIsConnected(true);
      setIsLoading(false);
    }
  }, [updateNetworkState]);

  useEffect(() => {
    let subscription: NetInfoSubscription | null = null;

    // Initial fetch
    const initialize = async () => {
      try {
        const state = await NetInfo.fetch();
        updateNetworkState(state);
      } catch {
        setIsConnected(true);
        setIsLoading(false);
      }

      // Subscribe to network state changes
      subscription = NetInfo.addEventListener(updateNetworkState);
    };

    initialize();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription();
      }
    };
  }, [updateNetworkState]);

  return {
    isConnected,
    isLoading,
    connectionType,
    isExpensive,
    refresh,
  };
}

export default useNetworkStatus;
