// Custom hooks for JobAppTracker Mobile
// This file will export all shared hooks

export { useTheme } from './useTheme';
export type { 
  ColorScheme, 
  ThemeColors, 
  UseThemeReturn 
} from './useTheme';

export { useFonts, fontFamily, fontAssets, getFontFamily } from './useFonts';
export type { 
  FontWeight, 
  UseFontsReturn 
} from './useFonts';

export { useNetworkStatus } from './useNetworkStatus';
export type { NetworkStatus } from './useNetworkStatus';

export { useOfflineMutation } from './useOfflineMutation';
export type { 
  UseOfflineMutationOptions, 
  UseOfflineMutationReturn 
} from './useOfflineMutation';

export { useHaptics } from './useHaptics';
export type { 
  HapticFeedbackType, 
  UseHapticsReturn 
} from './useHaptics';
