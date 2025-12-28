/**
 * Dashboard Screen
 * 
 * Main dashboard with job statistics, progress tracking, and job list.
 * Uses centralized theme system for consistent styling.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useJobs } from '../../features/jobs/hooks/useJobs';
import { useGoal } from '../../features/user/hooks/useGoal';
import { groupJobsByStatus, STATUS_DISPLAY_ORDER } from '../../features/jobs/utils/jobUtils';
import { Job } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius, statusColors } from '../../theme';

export default function DashboardScreen() {
  const { jobs, isLoading, refetch } = useJobs();
  const { dailyGoal } = useGoal();
  const router = useRouter();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const jobsByStatus = groupJobsByStatus(jobs);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleJobPress = (jobId: string) => {
    router.push(`/job/${jobId}`);
  };

  const handleAddJob = () => {
    router.push('/modals/add-job');
  };

  const handleGoalPress = () => {
    router.push('/modals/goal-setting');
  };

  // Calculate stats
  const todayJobs = jobs.filter(job => {
    const today = new Date();
    const jobDate = new Date(job.createdAt);
    return jobDate.toDateString() === today.toDateString();
  });

  const progress = dailyGoal > 0 ? Math.min((todayJobs.length / dailyGoal) * 100, 100) : 0;
  const isGoalReached = todayJobs.length >= dailyGoal && dailyGoal > 0;

  const getStatusColor = (status: string) => {
    const statusKey = status.toLowerCase();
    if (statusKey === 'applied') return statusColors.applied;
    if (statusKey === 'interviewing') return statusColors.interviewing;
    if (statusKey === 'offered') return statusColors.offered;
    if (statusKey === 'accepted') return statusColors.accepted;
    if (statusKey === 'rejected') return statusColors.rejected;
    return colors.primary;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome back,</Text>
          <Text style={[styles.titleText, { color: colors.text }]}>Job Seeker</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Loading State */}
        {isLoading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {!isLoading && (
          <>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{jobs.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Jobs</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statNumber, { color: colors.success }]}>{todayJobs.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Today</Text>
              </View>
              <TouchableOpacity 
                style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleGoalPress}
              >
                <Text style={[styles.statNumber, { color: colors.warning }]}>{dailyGoal}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Daily Goal</Text>
              </TouchableOpacity>
            </View>

            {/* Progress */}
            <View style={[styles.progressContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressTitle, { color: colors.text }]}>Today's Progress</Text>
                {isGoalReached && <View style={[styles.goalBadge, { backgroundColor: colors.success }]}><Text style={styles.goalBadgeText}>Done</Text></View>}
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.backgroundTertiary }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progress}%`,
                      backgroundColor: isGoalReached ? colors.success : colors.primary 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {todayJobs.length} / {dailyGoal} applications
                {isGoalReached && ' - Goal reached!'}
              </Text>
            </View>

            {/* Empty State */}
            {jobs.length === 0 && (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
                  <View style={[styles.emptyIconInner, { borderColor: colors.textTertiary }]} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No jobs yet</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Start tracking your job applications
                </Text>
                <TouchableOpacity 
                  style={[styles.emptyButton, { backgroundColor: colors.primary }]} 
                  onPress={handleAddJob}
                >
                  <Text style={[styles.emptyButtonText, { color: colors.textInverse }]}>Add Your First Job</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Jobs by Status */}
            {jobs.length > 0 && (
              <View style={styles.jobsSection}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Applications by Status</Text>
                {STATUS_DISPLAY_ORDER.map((status) => {
                  const statusJobs = jobsByStatus[status];
                  if (statusJobs.length === 0) return null;
                  
                  const statusColor = getStatusColor(status);
                  
                  return (
                    <View key={status} style={styles.statusSection}>
                      <View style={styles.statusHeader}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusTitle, { color: colors.text }]}>{status}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                          <Text style={[styles.statusCount, { color: statusColor }]}>{statusJobs.length}</Text>
                        </View>
                      </View>
                      {statusJobs.map((job: Job) => (
                        <TouchableOpacity
                          key={job.id}
                          style={[styles.jobCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                          onPress={() => handleJobPress(job.id)}
                        >
                          <View style={[styles.jobAccent, { backgroundColor: statusColor }]} />
                          <View style={styles.jobContent}>
                            <Text style={[styles.jobTitle, { color: colors.text }]}>{job.title}</Text>
                            <Text style={[styles.jobCompany, { color: colors.textSecondary }]}>{job.company}</Text>
                          </View>
                          <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={handleAddJob}>
        <Text style={[styles.fabText, { color: colors.textInverse }]}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  welcomeText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  titleText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
  },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  progressContainer: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  goalBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  goalBadgeText: {
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
  progressText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyIconInner: {
    width: 28,
    height: 32,
    borderWidth: 2,
    borderRadius: 4,
  },
  emptyTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginBottom: spacing['2xl'],
  },
  emptyButton: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  emptyButtonText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
  },
  jobsSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusSection: {
    marginBottom: spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  statusCount: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  jobAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  jobContent: {
    flex: 1,
    padding: spacing.md,
  },
  jobTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
  },
  jobCompany: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  chevron: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize['2xl'],
    paddingRight: spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontFamily: fontFamily.light,
    fontSize: 32,
  },
});
