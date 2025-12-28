/**
 * JobCard Component
 * 
 * Displays a job application card with title, company, and status.
 * Uses centralized theme system for consistent styling.
 * 
 * Requirements:
 * - 1.3: Apply Outfit font throughout
 * - 3.1: Use zinc-based color palette
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Job } from '../../types';
import { formatDate, formatRelativeDate } from '../../utils/date';
import { StatusBadge } from '../ui/Badge';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';

export interface JobCardProps {
  job: Job;
  onPress?: () => void;
  showStatus?: boolean;
}

export const JobCard = memo(function JobCard({ 
  job, 
  onPress, 
  showStatus = false 
}: JobCardProps) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
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
            {formatRelativeDate(job.createdAt)}
          </Text>
        </View>

        {showStatus && (
          <StatusBadge status={job.status} />
        )}

        <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
      </View>

      {job.deadline && (
        <View style={[styles.deadlineContainer, { borderTopColor: colors.border }]}>
          <Text style={[styles.deadline, { color: colors.textSecondary }]}>
            Deadline: {formatDate(job.deadline)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  chevron: {
    fontFamily: fontFamily.regular,
    marginLeft: spacing.sm,
    fontSize: fontSize.xl,
  },
  deadlineContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  deadline: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
  },
});

export default JobCard;
