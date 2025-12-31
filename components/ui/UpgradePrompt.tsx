/**
 * UpgradePrompt Component
 * 
 * A bottom sheet modal that encourages Free Tier users to sign in for unlimited access.
 * Displays a calm, professional modal with clear value proposition.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { EntityType } from '../../config/limits';
import { fontFamily, fontSize, spacing } from '../../theme';
import { lightColors, darkColors } from '../../theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7; // 70% of screen height

export interface UpgradePromptProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when the modal is dismissed */
  onDismiss: () => void;
  /** Optional callback when sign-in is successful */
  onSignInSuccess?: () => void;
  /** Optional entity type for contextual messaging */
  entityType?: EntityType;
}

/**
 * Benefit item component for displaying upgrade benefits
 */
const BenefitItem = ({ 
  icon, 
  title, 
  description, 
  colors 
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  title: string; 
  description: string;
  colors: typeof lightColors | typeof darkColors;
}) => (
  <View style={styles.benefitItem}>
    <View style={[styles.benefitIconContainer, { backgroundColor: colors.backgroundTertiary }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
    </View>
    <View style={styles.benefitTextContainer}>
      <Text style={[styles.benefitTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  </View>
);

/**
 * A bottom sheet modal that displays upgrade options for Free Tier users.
 * Shows benefits of signing in and provides Google sign-in action.
 * 
 * @example
 * ```tsx
 * <UpgradePrompt
 *   visible={showUpgrade}
 *   onDismiss={() => setShowUpgrade(false)}
 *   onSignInSuccess={() => router.replace('/(tabs)')}
 *   entityType="jobs"
 * />
 * ```
 */
export function UpgradePrompt({
  visible,
  onDismiss,
  onSignInSuccess,
  entityType,
}: UpgradePromptProps) {
  const { colors, isDark } = useTheme();
  const { signInWithGoogle, isLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const themeColors = isDark ? darkColors : lightColors;

  if (!visible) {
    return null;
  }

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        onDismiss();
        onSignInSuccess?.();
      } else if (result.error) {
        Alert.alert('Sign In Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDismiss = () => {
    if (!isSigningIn && !isLoading) {
      onDismiss();
    }
  };

  const isButtonDisabled = isSigningIn || isLoading;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={handleDismiss} />
      <View style={[styles.container, { backgroundColor: colors.background, height: MODAL_HEIGHT }]}>
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Headline */}
          <View style={styles.headlineContainer}>
            <Text style={[styles.headline, { color: colors.text }]}>
              Unlock unlimited tracking
            </Text>
            <Text style={[styles.subheadline, { color: colors.textSecondary }]}>
              Sign in to remove limits and sync across devices
            </Text>
          </View>

          {/* Benefits List */}
          <View style={styles.benefitsContainer}>
            <BenefitItem
              icon="infinite-outline"
              title="Unlimited items"
              description="Track unlimited jobs, notes, tasks, and habits"
              colors={themeColors}
            />
            <BenefitItem
              icon="cloud-outline"
              title="Cloud sync"
              description="Your data syncs automatically to the cloud"
              colors={themeColors}
            />
            <BenefitItem
              icon="phone-portrait-outline"
              title="Cross-device access"
              description="Access your data from any device"
              colors={themeColors}
            />
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {/* Primary CTA - Sign in with Google */}
            <Pressable
              onPress={handleSignIn}
              disabled={isButtonDisabled}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.primary },
                pressed && styles.buttonPressed,
                isButtonDisabled && styles.buttonDisabled,
              ]}
            >
              {isSigningIn ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <View style={styles.googleIconContainer}>
                    <Ionicons name="logo-google" size={18} color="#fff" />
                  </View>
                  <Text style={styles.primaryButtonText}>Sign in with Google</Text>
                </>
              )}
            </Pressable>

            {/* Secondary action - Maybe later */}
            <Pressable
              onPress={handleDismiss}
              disabled={isButtonDisabled}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && { opacity: 0.7 },
                isButtonDisabled && styles.buttonDisabled,
              ]}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                Maybe later
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  headline: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subheadline: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: fontSize.base * 1.5,
  },
  benefitsContainer: {
    flex: 1,
    gap: spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  benefitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    marginBottom: spacing.xxs,
  },
  benefitDescription: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
  },
  actionsContainer: {
    gap: spacing.md,
    marginTop: spacing['2xl'],
  },
  primaryButton: {
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
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
});

export default UpgradePrompt;
