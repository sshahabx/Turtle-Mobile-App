/**
 * Sign In Screen
 * 
 * Redesigned authentication screen with a calm, professional aesthetic.
 * Inspired by Linear, Notion, and Arc design principles.
 * Focuses on radical simplicity and intentional spacing.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Image, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing } from '../../theme';

export default function SignInScreen() {
  const router = useRouter();
  const { signInWithGoogle, continueOffline, isLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const [signingIn, setSigningIn] = useState<'google' | 'offline' | null>(null);

  const handleGoogleSignIn = async () => {
    setSigningIn('google');
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        router.replace('/(tabs)');
      } else if (result.error) {
        Alert.alert('Sign In Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google');
    } finally {
      setSigningIn(null);
    }
  };

  const handleContinueOffline = async () => {
    setSigningIn('offline');
    try {
      await continueOffline();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to continue');
    } finally {
      setSigningIn(null);
    }
  };

  const isButtonDisabled = isLoading || signingIn !== null;

  // Subtle warm background for light mode, keep dark for dark mode
  const backgroundColor = isDark ? colors.background : '#fafaf9';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* Brand Zone */}
        <View style={styles.brandZone}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.brandName, { color: colors.text }]}>Turtle</Text>
        </View>

        {/* Value Proposition Zone */}
        <View style={styles.valueZone}>
          <Text style={[styles.headline, { color: colors.text }]}>
            Your job search,{'\n'}organized.
          </Text>
          <Text style={[styles.subline, { color: colors.textSecondary }]}>
            Track applications with clarity and calm.
          </Text>
        </View>

        {/* Action Zone */}
        <View style={styles.actionZone}>
          {/* Primary CTA - Google Sign In */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={isButtonDisabled}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary },
              pressed && styles.buttonPressed,
              isButtonDisabled && styles.buttonDisabled,
            ]}
          >
            {signingIn === 'google' ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <View style={styles.googleIconContainer}>
                  <Ionicons name="logo-google" size={18} color="#fff" />
                </View>
                <Text style={styles.primaryButtonText}>Continue with Google</Text>
              </>
            )}
          </Pressable>

          {/* Secondary CTA - Continue without signing in */}
          <Pressable
            onPress={handleContinueOffline}
            disabled={isButtonDisabled}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && { opacity: 0.7 },
              isButtonDisabled && styles.buttonDisabled,
            ]}
          >
            {signingIn === 'offline' ? (
              <ActivityIndicator color={colors.textSecondary} size="small" />
            ) : (
              <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                Continue without signing in
              </Text>
            )}
          </Pressable>
        </View>

        {/* Privacy note - minimal, low emphasis */}
        <Text style={[styles.privacyNote, { color: colors.textTertiary }]}>
          Your data stays private and syncs securely.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
    paddingTop: spacing['4xl'],
    paddingBottom: spacing['3xl'],
  },
  
  // Brand Zone
  brandZone: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  logo: {
    width: 56,
    height: 56,
    marginBottom: spacing.lg,
  },
  brandName: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    letterSpacing: 0.5,
  },
  
  // Value Proposition Zone
  valueZone: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  headline: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  subline: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Action Zone
  actionZone: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.lg,
  },
  primaryButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: spacing.sm,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    color: '#fff',
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  secondaryButtonText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  
  // Privacy Note
  privacyNote: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing['3xl'],
    lineHeight: 16,
  },
});
