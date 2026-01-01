/**
 * DailyProgress Component
 * 
 * Displays daily job application progress with goal tracking.
 * Uses centralized theme system for consistent styling.
 * 
 * Requirements:
 * - 1.3: Apply Outfit font throughout
 * - 3.1: Use zinc-based color palette
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Job } from '../../types';
import { getJobsCreatedToday } from '../../features/jobs/utils/jobUtils';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius, semanticColors } from '../../theme';

export interface DailyProgressProps {
  jobs: Job[];
  dailyGoal: number;
  onGoalPress?: () => void;
}

export function DailyProgress({ jobs, dailyGoal, onGoalPress }: DailyProgressProps) {
  const { colors } = useTheme();
  const todaysJobs = getJobsCreatedToday(jobs);
  const currentCount = todaysJobs.length;
  const progress = dailyGoal > 0 ? Math.min((currentCount / dailyGoal) * 100, 100) : 0;
  const isGoalReached = currentCount >= dailyGoal;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Today's Progress</Text>
        <TouchableOpacity onPress={onGoalPress} activeOpacity={0.7}>
          <Text style={[styles.setGoalText, { color: colors.primary }]}>Set Goal</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.countRow}>
        <Text style={[styles.currentCount, { color: colors.text }]}>{currentCount}</Text>
        <Text style={[styles.goalCount, { color: colors.textSecondary }]}>/ {dailyGoal}</Text>
        {isGoalReached && (
          <View style={[styles.doneBadge, { backgroundColor: semanticColors.success }]}>
            <Text style={styles.doneBadgeText}>Done</Text>
          </View>
        )}
      </View>

      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { 
              backgroundColor: isGoalReached ? semanticColors.success : colors.primary,
              width: `${progress}%` 
            }
          ]}
        />
      </View>

      {isGoalReached && (
        <Text style={[styles.successText, { color: semanticColors.success }]}>Goal reached! Great job!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  setGoalText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  currentCount: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
  },
  goalCount: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    marginLeft: spacing.xs,
  },
  doneBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  doneBadgeText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: '#fff',
  },
  progressBar: {
    height: 8,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  successText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});

export default DailyProgress;
