/**
 * CareerScoreDisplay Component
 *
 * Displays the user's career score with reflective language and visual tier theming.
 * Uses calm, non-competitive framing ("Your Journey: X points").
 *
 * Requirements:
 * - 6.3: Career_Score SHALL be displayed subtly in the Journey section header
 * - 6.6: Career_Score display SHALL use reflective language
 * - 9.1: Use the app's existing zinc-based neutral color palette
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, lineHeight } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { emerald, zinc } from '../../theme/colors';
import type { VisualTier } from '../../types/journey';

export interface CareerScoreDisplayProps {
  /** The user's current career score */
  score: number;
  /** The current visual tier based on career score */
  visualTier: VisualTier;
}

/**
 * Get tier-specific accent color for subtle theming
 */
function getTierAccentColor(tier: VisualTier, isDark: boolean): string {
  switch (tier) {
    case 'seedling':
      return isDark ? zinc[500] : zinc[400];
    case 'sapling':
      return isDark ? emerald[600] : emerald[500];
    case 'grove':
      return isDark ? emerald[500] : emerald[600];
    case 'forest':
      return isDark ? emerald[400] : emerald[700];
    default:
      return isDark ? zinc[500] : zinc[400];
  }
}

/**
 * Get tier display name for accessibility
 */
function getTierDisplayName(tier: VisualTier): string {
  switch (tier) {
    case 'seedling':
      return 'Seedling';
    case 'sapling':
      return 'Sapling';
    case 'grove':
      return 'Grove';
    case 'forest':
      return 'Forest';
    default:
      return 'Seedling';
  }
}

export function CareerScoreDisplay({ score, visualTier }: CareerScoreDisplayProps) {
  const { colors, isDark } = useTheme();
  const accentColor = getTierAccentColor(visualTier, isDark);
  const tierName = getTierDisplayName(visualTier);

  return (
    <View style={styles.container}>
      {/* Reflective language header */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Your Journey
      </Text>
      
      {/* Score display */}
      <View style={styles.scoreRow}>
        <Text style={[styles.score, { color: colors.text }]}>
          {score.toLocaleString()}
        </Text>
        <Text style={[styles.pointsLabel, { color: colors.textMuted }]}>
          {' '}points
        </Text>
      </View>
      
      {/* Visual tier indicator */}
      <View style={styles.tierRow}>
        <View style={[styles.tierDot, { backgroundColor: accentColor }]} />
        <Text style={[styles.tierLabel, { color: accentColor }]}>
          {tierName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    marginBottom: spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * lineHeight.tight,
  },
  pointsLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  tierLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    textTransform: 'capitalize',
  },
});

export default CareerScoreDisplay;
