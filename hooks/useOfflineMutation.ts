/**
 * Offline Mutation Hook
 * 
 * Provides utilities for handling mutations when offline.
 * Shows appropriate messages when actions require connectivity.
 * 
 * Requirements:
 * - 12.3: Show message for actions requiring connectivity when offline
 */

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNetworkStatus } from './useNetworkStatus';

export interface UseOfflineMutationOptions {
  /** Custom message to show when offline */
  offlineMessage?: string;
  /** Whether to use Alert instead of Toast (for critical actions) */
  useAlert?: boolean;
}

export interface UseOfflineMutationReturn {
  /** Whether the device is currently online */
  isOnline: boolean;
  /** Whether the device is currently offline */
  isOffline: boolean;
  /** Check if online and show message if not. Returns true if online. */
  checkOnline: () => boolean;
  /** 
   * Execute a function only if online. 
   * Shows offline message and returns undefined if offline.
   */
  executeIfOnline: <T>(fn: () => T | Promise<T>) => Promise<T | undefined>;
}

const DEFAULT_OFFLINE_MESSAGE = "You're offline. This action requires an internet connection.";

/**
 * Hook for handling mutations when offline.
 * Provides utilities to check connectivity and show appropriate messages.
 * 
 * @example
 * ```tsx
 * const { checkOnline, executeIfOnline } = useOfflineMutation();
 * 
 * // Option 1: Manual check before mutation
 * const handleSave = async () => {
 *   if (!checkOnline()) return;
 *   await addJob.mutateAsync(data);
 * };
 * 
 * // Option 2: Wrap the mutation call
 * const handleSave = async () => {
 *   await executeIfOnline(() => addJob.mutateAsync(data));
 * };
 * ```
 */
export function useOfflineMutation(
  options: UseOfflineMutationOptions = {}
): UseOfflineMutationReturn {
  const { 
    offlineMessage = DEFAULT_OFFLINE_MESSAGE,
    useAlert = true,
  } = options;
  
  const { isConnected } = useNetworkStatus();

  const isOnline = isConnected;
  const isOffline = !isConnected;

  /**
   * Show offline message to user
   */
  const showOfflineMessage = useCallback(() => {
    if (useAlert) {
      Alert.alert(
        'No Connection',
        offlineMessage,
        [{ text: 'OK' }]
      );
    }
  }, [offlineMessage, useAlert]);

  /**
   * Check if online and show message if not
   * @returns true if online, false if offline
   */
  const checkOnline = useCallback((): boolean => {
    if (!isConnected) {
      showOfflineMessage();
      return false;
    }
    return true;
  }, [isConnected, showOfflineMessage]);

  /**
   * Execute a function only if online
   * Shows offline message and returns undefined if offline
   */
  const executeIfOnline = useCallback(
    async <T>(fn: () => T | Promise<T>): Promise<T | undefined> => {
      if (!checkOnline()) {
        return undefined;
      }
      return fn();
    },
    [checkOnline]
  );

  return {
    isOnline,
    isOffline,
    checkOnline,
    executeIfOnline,
  };
}

export default useOfflineMutation;
