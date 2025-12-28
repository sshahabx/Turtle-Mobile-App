/**
 * Offline Indicator Component
 * 
 * Displays a banner when the device is offline to inform users
 * that they are viewing cached data.
 * 
 * Requirements:
 * - 12.2: Display an indicator showing offline status when offline and viewing data
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export interface OfflineIndicatorProps {
  /** Custom message to display when offline */
  message?: string;
  /** Whether to show a retry button */
  showRetry?: boolean;
  /** Callback when retry is pressed */
  onRetry?: () => void;
}

/**
 * A banner component that appears when the device loses network connectivity.
 * Animates in/out smoothly and provides optional retry functionality.
 * 
 * @example
 * ```tsx
 * <OfflineIndicator 
 *   message="You're offline. Showing cached data."
 *   showRetry
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export function OfflineIndicator({
  message = "You're offline. Showing cached data.",
  showRetry = false,
  onRetry,
}: OfflineIndicatorProps) {
  const { isConnected, isLoading, refresh } = useNetworkStatus();
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) return;

    if (!isConnected) {
      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -60,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isConnected, isLoading, slideAnim, opacityAnim]);

  const handleRetry = async () => {
    await refresh();
    if (onRetry) {
      onRetry();
    }
  };

  // Don't render anything while loading or when connected
  if (isLoading || isConnected) {
    return null;
  }

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
      className="absolute top-0 left-0 right-0 z-40"
    >
      <View className="bg-amber-500 dark:bg-amber-600 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Text className="text-lg mr-2">📡</Text>
          <Text className="text-white font-medium flex-1" numberOfLines={2}>
            {message}
          </Text>
        </View>
        {showRetry && (
          <TouchableOpacity
            onPress={handleRetry}
            className="ml-3 bg-white/20 px-3 py-1.5 rounded-md"
            activeOpacity={0.7}
          >
            <Text className="text-white font-semibold text-sm">Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

export default OfflineIndicator;
