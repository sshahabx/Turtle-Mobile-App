import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback patterns for common interactions
 */
export type HapticFeedbackType = 
  | 'success'
  | 'error'
  | 'warning'
  | 'selection'
  | 'light'
  | 'medium'
  | 'heavy';

export interface UseHapticsReturn {
  /**
   * Trigger success haptic feedback (notification success)
   */
  success: () => Promise<void>;
  
  /**
   * Trigger error haptic feedback (notification error)
   */
  error: () => Promise<void>;
  
  /**
   * Trigger warning haptic feedback (notification warning)
   */
  warning: () => Promise<void>;
  
  /**
   * Trigger selection haptic feedback (light tap for selections)
   */
  selection: () => Promise<void>;
  
  /**
   * Trigger light impact feedback
   */
  light: () => Promise<void>;
  
  /**
   * Trigger medium impact feedback
   */
  medium: () => Promise<void>;
  
  /**
   * Trigger heavy impact feedback
   */
  heavy: () => Promise<void>;
  
  /**
   * Trigger haptic feedback by type
   */
  trigger: (type: HapticFeedbackType) => Promise<void>;
  
  /**
   * Whether haptics are supported on this device
   */
  isSupported: boolean;
}

/**
 * Hook for providing haptic feedback on user interactions.
 * Wraps expo-haptics with common feedback patterns.
 * 
 * @example
 * ```tsx
 * const { success, error, selection } = useHaptics();
 * 
 * const handleSave = async () => {
 *   try {
 *     await saveData();
 *     await success();
 *   } catch (e) {
 *     await error();
 *   }
 * };
 * ```
 */
export function useHaptics(): UseHapticsReturn {
  // Haptics are only supported on iOS and Android
  const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

  const success = async (): Promise<void> => {
    if (!isSupported) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Silently fail if haptics unavailable
    }
  };

  const error = async (): Promise<void> => {
    if (!isSupported) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Silently fail if haptics unavailable
    }
  };

  const warning = async (): Promise<void> => {
    if (!isSupported) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Silently fail if haptics unavailable
    }
  };

  const selection = async (): Promise<void> => {
    if (!isSupported) return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // Silently fail if haptics unavailable
    }
  };

  const light = async (): Promise<void> => {
    if (!isSupported) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Silently fail if haptics unavailable
    }
  };

  const medium = async (): Promise<void> => {
    if (!isSupported) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Silently fail if haptics unavailable
    }
  };

  const heavy = async (): Promise<void> => {
    if (!isSupported) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Silently fail if haptics unavailable
    }
  };

  const trigger = async (type: HapticFeedbackType): Promise<void> => {
    switch (type) {
      case 'success':
        return success();
      case 'error':
        return error();
      case 'warning':
        return warning();
      case 'selection':
        return selection();
      case 'light':
        return light();
      case 'medium':
        return medium();
      case 'heavy':
        return heavy();
    }
  };

  return {
    success,
    error,
    warning,
    selection,
    light,
    medium,
    heavy,
    trigger,
    isSupported,
  };
}
