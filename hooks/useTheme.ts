/**
 * Theme Hook
 * 
 * Provides theme management with support for light, dark, and system modes.
 * Integrates with UI store for persistence and system color scheme detection.
 * 
 * Requirements:
 * - 13.1: Automatically update to match system preference
 */

import { useColorScheme } from 'react-native';
import { useCallback, useMemo } from 'react';
import { useUIStore, ThemeMode } from '../store/uiStore';

export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Surface colors (cards, modals)
  surface: string;
  surfaceSecondary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  textTertiary: string;
  textInverse: string;
  
  // Border colors
  border: string;
  borderSecondary: string;
  
  // Primary brand colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Status bar style
  statusBarStyle: 'light' | 'dark';
}

const lightColors: ThemeColors = {
  // Background colors - clean white/gray
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  backgroundTertiary: '#f1f5f9',
  
  // Surface colors
  surface: '#ffffff',
  surfaceSecondary: '#f8fafc',
  
  // Text colors - zinc-based for consistency with web app
  text: '#18181b',           // zinc-900
  textSecondary: '#52525b',  // zinc-600
  textMuted: '#71717a',      // zinc-500
  textTertiary: '#71717a',   // zinc-500
  textInverse: '#ffffff',
  
  // Border colors
  border: '#e4e4e7',         // zinc-200
  borderSecondary: '#d4d4d8', // zinc-300
  
  // Primary brand colors - emerald green like web app
  primary: '#10b981',        // emerald-500
  primaryLight: '#34d399',   // emerald-400
  primaryDark: '#059669',    // emerald-600
  
  // Status colors
  success: '#10b981',        // emerald-500
  warning: '#f59e0b',        // amber-500
  error: '#ef4444',          // red-500
  info: '#3b82f6',           // blue-500
  
  statusBarStyle: 'dark',
};

const darkColors: ThemeColors = {
  // Background colors - zinc-based dark
  background: '#09090b',     // zinc-950
  backgroundSecondary: '#18181b',  // zinc-900
  backgroundTertiary: '#27272a',   // zinc-800
  
  // Surface colors
  surface: '#18181b',        // zinc-900
  surfaceSecondary: '#27272a', // zinc-800
  
  // Text colors - zinc-based for consistency with web app
  text: '#f4f4f5',           // zinc-100
  textSecondary: '#a1a1aa',  // zinc-400
  textMuted: '#71717a',      // zinc-500
  textTertiary: '#71717a',   // zinc-500
  textInverse: '#18181b',    // zinc-900
  
  // Border colors
  border: '#27272a',         // zinc-800
  borderSecondary: '#3f3f46', // zinc-700
  
  // Primary brand colors - emerald green (lighter for dark mode)
  primary: '#34d399',        // emerald-400
  primaryLight: '#6ee7b7',   // emerald-300
  primaryDark: '#10b981',    // emerald-500
  
  // Status colors (slightly lighter for dark mode)
  success: '#34d399',        // emerald-400
  warning: '#fbbf24',        // amber-400
  error: '#f87171',          // red-400
  info: '#60a5fa',           // blue-400
  
  statusBarStyle: 'light',
};

export interface UseThemeReturn {
  /** Current color scheme ('light' or 'dark') */
  colorScheme: ColorScheme;
  /** Whether dark mode is active */
  isDark: boolean;
  /** Theme colors for current scheme */
  colors: ThemeColors;
  /** Get a color value by key */
  getColor: (key: keyof ThemeColors) => string;
  /** Current theme mode setting */
  themeMode: ThemeMode;
  /** Set theme mode */
  setThemeMode: (mode: ThemeMode) => void;
  /** Toggle between theme modes */
  toggleTheme: () => void;
}

/**
 * Hook for accessing theme information and colors.
 * Supports light, dark, and system theme modes with persistence.
 * 
 * @example
 * ```tsx
 * const { isDark, colors, colorScheme, toggleTheme } = useTheme();
 * 
 * return (
 *   <View style={{ backgroundColor: colors.background }}>
 *     <Text style={{ color: colors.text }}>Hello</Text>
 *     <Button onPress={toggleTheme}>Toggle Theme</Button>
 *   </View>
 * );
 * ```
 */
export function useTheme(): UseThemeReturn {
  const systemColorScheme = useColorScheme();
  const { themeMode, setThemeMode, toggleTheme } = useUIStore();
  
  // Determine actual color scheme based on theme mode
  const colorScheme: ColorScheme = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme ?? 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);
  
  const isDark = colorScheme === 'dark';
  
  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);
  
  const getColor = useCallback((key: keyof ThemeColors): string => {
    return colors[key];
  }, [colors]);
  
  return {
    colorScheme,
    isDark,
    colors,
    getColor,
    themeMode,
    setThemeMode,
    toggleTheme,
  };
}

export { lightColors, darkColors };
export default useTheme;
