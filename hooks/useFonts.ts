import * as Font from 'expo-font';
import { useCallback, useEffect, useState } from 'react';

/**
 * Font assets for the Outfit font family
 * These fonts are loaded from the local assets/fonts directory
 */
export const fontAssets = {
  'Outfit-Light': require('../assets/fonts/Outfit-Light.ttf'),
  'Outfit-Regular': require('../assets/fonts/Outfit-Regular.ttf'),
  'Outfit-Medium': require('../assets/fonts/Outfit-Medium.ttf'),
  'Outfit-SemiBold': require('../assets/fonts/Outfit-SemiBold.ttf'),
  'Outfit-Bold': require('../assets/fonts/Outfit-Bold.ttf'),
  'Outfit-ExtraBold': require('../assets/fonts/Outfit-ExtraBold.ttf'),
};

/**
 * Font family names for use in styles
 */
export const fontFamily = {
  light: 'Outfit-Light',
  regular: 'Outfit-Regular',
  medium: 'Outfit-Medium',
  semibold: 'Outfit-SemiBold',
  bold: 'Outfit-Bold',
  extrabold: 'Outfit-ExtraBold',
  // Fallback for when fonts haven't loaded
  fallback: 'System',
} as const;

export type FontWeight = keyof typeof fontFamily;

export interface UseFontsReturn {
  fontsLoaded: boolean;
  fontError: Error | null;
}

/**
 * Custom hook for loading Outfit fonts
 * Returns loading state and any errors that occurred during font loading
 * 
 * @example
 * const { fontsLoaded, fontError } = useFonts();
 * 
 * if (!fontsLoaded && !fontError) {
 *   return <LoadingScreen />;
 * }
 */
export function useFonts(): UseFontsReturn {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState<Error | null>(null);

  const loadFonts = useCallback(async () => {
    try {
      await Font.loadAsync(fontAssets);
      setFontsLoaded(true);
    } catch (error) {
      console.error('Error loading fonts:', error);
      setFontError(error instanceof Error ? error : new Error('Failed to load fonts'));
      // Still set fontsLoaded to true so the app can continue with fallback fonts
      setFontsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadFonts();
  }, [loadFonts]);

  return { fontsLoaded, fontError };
}

/**
 * Helper function to get the font family name for a given weight
 * Falls back to system font if fonts haven't loaded
 * 
 * @param weight - The font weight to use
 * @param loaded - Whether fonts have been loaded
 * @returns The font family name to use in styles
 */
export function getFontFamily(weight: FontWeight = 'regular', loaded: boolean = true): string {
  if (!loaded) {
    return fontFamily.fallback;
  }
  return fontFamily[weight] || fontFamily.regular;
}
