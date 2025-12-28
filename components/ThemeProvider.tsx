/**
 * Theme Provider Component
 * 
 * Provides theme context to the entire application.
 * Automatically detects system color scheme and applies appropriate theme.
 * 
 * Requirements:
 * - 13.1: Automatically update to match system preference
 * - 13.2: Use appropriate contrast ratios for readability in dark mode
 * - 13.3: Use standard light color scheme in light mode
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme, View, ViewProps } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  ColorScheme, 
  ThemeColors, 
  lightColors, 
  darkColors 
} from '../hooks/useTheme';

export interface ThemeContextValue {
  /** Current color scheme ('light' or 'dark') */
  colorScheme: ColorScheme;
  /** Whether dark mode is active */
  isDark: boolean;
  /** Theme colors for current scheme */
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme Provider
 * 
 * Wraps the application and provides theme context based on system preference.
 * Automatically updates when system theme changes.
 * 
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  
  // Default to light if system preference is null
  const colorScheme: ColorScheme = systemColorScheme ?? 'light';
  const isDark = colorScheme === 'dark';
  
  const value = useMemo<ThemeContextValue>(() => ({
    colorScheme,
    isDark,
    colors: isDark ? darkColors : lightColors,
  }), [colorScheme, isDark]);
  
  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context.
 * Must be used within a ThemeProvider.
 * 
 * @throws Error if used outside of ThemeProvider
 */
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Themed View Component
 * 
 * A View that automatically applies the appropriate background color
 * based on the current theme.
 */
export interface ThemedViewProps extends ViewProps {
  /** Background variant */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'surface';
}

export function ThemedView({ 
  variant = 'primary', 
  style, 
  ...props 
}: ThemedViewProps) {
  const { colors } = useThemeContext();
  
  const backgroundColor = useMemo(() => {
    switch (variant) {
      case 'secondary':
        return colors.backgroundSecondary;
      case 'tertiary':
        return colors.backgroundTertiary;
      case 'surface':
        return colors.surface;
      default:
        return colors.background;
    }
  }, [variant, colors]);
  
  return (
    <View 
      style={[{ backgroundColor }, style]} 
      {...props} 
    />
  );
}

export default ThemeProvider;
