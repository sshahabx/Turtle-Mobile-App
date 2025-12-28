/**
 * Sign In Screen
 * 
 * Authentication screen with Google OAuth.
 * Supports dark mode and uses emerald theme.
 * Users can also continue without signing in (offline mode).
 */

import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Image, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>Turtle</Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your job applications and land your dream job
        </Text>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem text="Track all your job applications" colors={colors} isDark={isDark} />
          <FeatureItem text="Monitor your progress with stats" colors={colors} isDark={isDark} />
          <FeatureItem text="Manage tasks and habits" colors={colors} isDark={isDark} />
          <FeatureItem text="Sync across devices" colors={colors} isDark={isDark} />
        </View>

        {/* Google Sign In */}
        <View style={styles.authButtons}>
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={isButtonDisabled}
            style={[
              styles.oauthButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isButtonDisabled && styles.buttonDisabled,
            ]}
          >
            {signingIn === 'google' ? (
              <ActivityIndicator color={colors.text} size="small" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={[styles.oauthButtonText, { color: colors.text }]}>
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Continue Offline Button */}
        <Pressable
          onPress={handleContinueOffline}
          disabled={isButtonDisabled}
          style={[
            styles.offlineButton,
            { backgroundColor: colors.primary },
            isButtonDisabled && { backgroundColor: colors.primaryLight },
          ]}
        >
          {signingIn === 'offline' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.offlineButtonText}>Continue without signing in</Text>
          )}
        </Pressable>

        {/* Footer */}
        <Text style={[styles.footer, { color: colors.textTertiary }]}>
          Sign in to sync your data across devices.{'\n'}
          Or use offline mode to store data locally.
        </Text>
      </View>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  text: string;
  colors: ReturnType<typeof useTheme>['colors'];
  isDark: boolean;
}

function FeatureItem({ text, colors, isDark }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIcon, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5' }]}>
        <View style={[styles.checkmark, { borderColor: colors.primary }]} />
      </View>
      <Text style={[styles.featureText, { color: colors.text }]}>{text}</Text>
    </View>
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
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  features: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkmark: {
    width: 10,
    height: 5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  featureText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    flex: 1,
  },
  authButtons: {
    width: '100%',
    gap: spacing.md,
  },
  oauthButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  oauthButtonText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginHorizontal: spacing.md,
  },
  offlineButton: {
    width: '100%',
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  offlineButtonText: {
    fontFamily: fontFamily.semibold,
    color: '#fff',
    fontSize: fontSize.base,
  },
  footer: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: spacing.xl,
    textAlign: 'center',
    lineHeight: 18,
  },
});
