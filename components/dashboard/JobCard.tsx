/**
 * JobCard Component
 * 
 * Displays a minimalistic job application card with essential information only.
 * Uses centralized theme system for consistent styling.
 * 
 * Requirements:
 * - 1.3: Apply Outfit font throughout
 * - 3.1: Use zinc-based color palette
 * - 6.3: Display only essential information: title, company, and relative date
 * - 6.5: Maintain adequate whitespace between UI elements
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Job } from '../../types';
import { formatRelativeDate } from '../../utils/date';
import { StatusBadge } from '../ui/Badge';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';

export interface JobCardProps {
  /** The job to display */
  job: Job;
  /** Callback when the card is pressed */
  onPress?: () => void;
  /** Whether to show the status badge (used in search results mode) */
  showStatus?: boolean;
}

export function JobCard({ 
  job, 
  onPress, 
  showStatus = false 
}: JobCardProps) {
  const { colors } = useTheme();
  
  // Ensure createdAt is a Date object
  const createdAtDate = job.createdAt instanceof Date 
    ? job.createdAt 
    : new Date(job.createdAt);
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessibilityRole="button"
      accessibilityLabel={`${job.title} at ${job.company}, ${formatRelativeDate(createdAtDate)}`}
    >
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {job.title}
          </Text>
          
          <Text style={[styles.company, { color: colors.textSecondary }]} numberOfLines={1}>
            {job.company}
          </Text>
          
          <Text style={[styles.date, { color: colors.textTertiary }]}>
            {formatRelativeDate(createdAtDate)}
          </Text>
        </View>

        {showStatus && (
          <View style={styles.statusContainer}>
            <StatusBadge status={job.status} />
          </View>
        )}

        <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    marginBottom: spacing.xs,
  },
  company: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  date: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
  },
  statusContainer: {
    marginRight: spacing.sm,
  },
  chevron: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xl,
  },
});

export default JobCard;
