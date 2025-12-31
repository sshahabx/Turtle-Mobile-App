/**
 * Index/Entry Screen
 * 
 * Entry point that checks authentication status and routes accordingly.
 * Shows splash screen while checking auth, then redirects to:
 * - Sign-in screen if not authenticated
 * - Main tabs if authenticated or in offline mode
 */

import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightColors, darkColors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { isAuthenticated as checkOAuthAuth } from '../features/auth/services/authService';

export default function Index() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRoute = async () => {
      try {
        // Check if user is authenticated via OAuth
        const isOAuthAuthenticated = await checkOAuthAuth();

        console.log('Auth check:', { isOAuthAuthenticated });

        // Small delay for splash screen visibility
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (isOAuthAuthenticated) {
          // User is authenticated via OAuth - go to main app
          console.log('User authenticated via OAuth, going to tabs');
          router.replace('/(tabs)');
        } else {
          // User needs to sign in - don't assume offline mode
          console.log('User not authenticated, going to sign-in');
          router.replace('/(auth)/sign-in');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // On error, go to sign-in
        router.replace('/(auth)/sign-in');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthAndRoute();
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* App name */}
        <Text style={[styles.title, { color: colors.text }]}>Turtle</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your job applications
        </Text>
        
        {/* Loading indicator */}
        {isChecking && (
          <ActivityIndicator 
            size="large" 
            color={colors.primary} 
            style={styles.loader}
          />
        )}
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
    padding: spacing['2xl'],
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'],
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    marginBottom: spacing['2xl'],
  },
  loader: {
    marginTop: spacing.xl,
  },
});
