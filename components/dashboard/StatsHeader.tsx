/**
 * StatsHeader Component
 * 
 * Displays overview statistics for job applications.
 * Uses centralized theme system for consistent styling.
 * 
 * Requirements:
 * - 1.3: Apply Outfit font throughout
 * - 3.1: Use zinc-based color palette
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Job, JobStatus } from '../../types';
import { getJobCountsByStatus } from '../../features/jobs/utils/jobUtils';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, statusColors, semanticColors } from '../../theme';

export interface StatsHeaderProps {
  jobs: Job[];
}

interface StatItemProps {
  label: string;
  value: number;
  color: string;
  textSecondaryColor: string;
}

function StatItem({ label, value, color, textSecondaryColor }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: textSecondaryColor }]}>{label}</Text>
    </View>
  );
}

export function StatsHeader({ jobs }: StatsHeaderProps) {
  const { colors } = useTheme();
  const counts = getJobCountsByStatus(jobs);
  
  const totalApplications = jobs.length;
  const interviews = counts[JobStatus.INTERVIEWING];
  const offers = counts[JobStatus.OFFERED] + counts[JobStatus.ACCEPTED];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>Overview</Text>
      <View style={styles.statsRow}>
        <StatItem
          label="Applications"
          value={totalApplications}
          color={statusColors.applied}
          textSecondaryColor={colors.textSecondary}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <StatItem
          label="Interviews"
          value={interviews}
          color={statusColors.interviewing}
          textSecondaryColor={colors.textSecondary}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <StatItem
          label="Offers"
          value={offers}
          color={semanticColors.success}
          textSecondaryColor={colors.textSecondary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
  },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  divider: {
    width: 1,
    marginHorizontal: spacing.sm,
  },
});

export default StatsHeader;
