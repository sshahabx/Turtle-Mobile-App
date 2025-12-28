/**
 * Custom Splash Screen Component
 * 
 * Displays the Turtle branding with logo and app name.
 * Supports light and dark mode backgrounds.
 * 
 * Requirements:
 * - 2.1: Display the app name "Turtle" prominently
 * - 2.2: Display the logo at a reduced size (64px)
 * - 2.3: Use the Outfit font for the "Turtle" text
 * - 2.4: Support both light and dark mode backgrounds
 */

import React from 'react';
import { View, Text, Image, StyleSheet, useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export interface SplashScreenProps {
  /** Optional callback when splash screen animation completes */
  onFinish?: () => void;
}

/**
 * Custom splash screen component with Turtle branding
 * 
 * @example
 * ```tsx
 * <SplashScreen onFinish={() => setShowSplash(false)} />
 * ```
 */
export function SplashScreen({ onFinish }: SplashScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Logo at 64px size */}
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* App name "Turtle" with Outfit-Bold font */}
        <Text style={[styles.title, { color: colors.text }]}>
          Turtle
        </Text>
        
        {/* Tagline */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your job applications
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'], // 30px
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base, // 16px
  },
});

export default SplashScreen;
