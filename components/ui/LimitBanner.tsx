/**
 * LimitBanner Component
 * 
 * Displays current usage and remaining capacity for Free Tier users.
 * Tappable to show upgrade prompt. Hidden for Premium tier users.
 * 
 * Requirements: 1.3, 2.3, 3.3, 4.3, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLimits } from '../../hooks/useLimits';
import { EntityType } from '../../config/limits';
import { getColorScheme, formatLimitText, ColorScheme } from '../../utils/limitUtils';
import { componentBorderRadius } from '../../theme/borderRadius';
import { fontFamily, fontSize, lineHeight } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { semanticColors, lightColors, darkColors } from '../../theme/colors';

export interface LimitBannerProps {
  /** The type of entity to show limits for */
  entityType: EntityType;
  /** Human-readable label for the entity (e.g., "jobs", "notes") */
  entityLabel: string;
  /** Optional callback when upgrade is pressed (defaults to showing UpgradePrompt) */
  onUpgradePress?: () => void;
}

/**
 * Get colors based on the color scheme (neutral, warning, alert)
 */
const getSchemeColors = (
  scheme: ColorScheme,
  isDark: boolean
): { bg: string; text: string; iconName: keyof typeof Ionicons.glyphMap } => {
  switch (scheme) {
    case 'alert':
      return {
        bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
        text: isDark ? '#f87171' : '#b91c1c',
        iconName: 'warning-outline',
      };
    case 'warning':
      return {
        bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
        text: isDark ? '#fbbf24' : '#b45309',
        iconName: 'bar-chart-outline',
      };
    case 'neutral':
    default:
      return {
        bg: isDark ? darkColors.backgroundTertiary : lightColors.backgroundTertiary,
        text: isDark ? darkColors.textSecondary : lightColors.textSecondary,
        iconName: 'bar-chart-outline',
      };
  }
};

/**
 * A banner component that displays the current usage against the limit
 * for Free Tier users. Hidden for Premium tier users.
 * 
 * @example
 * ```tsx
 * <LimitBanner 
 *   entityType="jobs"
 *   entityLabel="jobs"
 *   onUpgradePress={() => setShowUpgrade(true)}
 * />
 * ```
 */
export function LimitBanner({
  entityType,
  entityLabel,
  onUpgradePress,
}: LimitBannerProps) {
  const { isDark } = useTheme();
  const { 
    currentCount, 
    maxLimit, 
    usagePercentage, 
    isAtLimit, 
    isFreeTier, 
    isLoading 
  } = useLimits(entityType);

  // Don't render for Premium tier users (Requirement 6.6)
  if (!isFreeTier) {
    return null;
  }

  // Don't render while loading
  if (isLoading) {
    return null;
  }

  const colorScheme = getColorScheme(usagePercentage);
  const schemeColors = getSchemeColors(colorScheme, isDark);
  
  // Format the display text
  const limitText = isAtLimit 
    ? `Limit reached • ${formatLimitText(currentCount, maxLimit, entityLabel)}`
    : formatLimitText(currentCount, maxLimit, entityLabel);

  const handlePress = () => {
    if (onUpgradePress) {
      onUpgradePress();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: schemeColors.bg }]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${limitText}. Tap to upgrade.`}
      accessibilityHint="Opens upgrade options"
    >
      <View style={styles.content}>
        <Ionicons 
          name={schemeColors.iconName} 
          size={16} 
          color={schemeColors.text} 
          style={styles.icon}
        />
        <Text style={[styles.text, { color: schemeColors.text }]}>
          {limitText}
        </Text>
      </View>
      <Text style={[styles.upgradeText, { color: schemeColors.text }]}>
        Upgrade →
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: componentBorderRadius.card,
    marginBottom: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    flex: 1,
  },
  upgradeText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    marginLeft: spacing.sm,
  },
});

export default LimitBanner;
