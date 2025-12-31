/**
 * StatsHeader Component
 * 
 * Displays simple count of total job applications.
 * Uses centralized theme system for consistent styling.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Job } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing } from '../../theme';

export interface StatsHeaderProps {
  jobs: Job[];
}

export function StatsHeader({ jobs }: StatsHeaderProps) {
  const { colors } = useTheme();
  const totalApplications = jobs.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <Text style={[styles.count, { color: colors.primary }]}>{totalApplications}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Applications</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  count: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'],
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
});

export default StatsHeader;
