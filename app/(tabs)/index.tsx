/**
 * Dashboard Screen
 * 
 * Main dashboard with job statistics, progress tracking, and job list.
 * Uses centralized theme system for consistent styling.
 * 
 * Features:
 * - Profile icon that opens a sidebar with Journey and Profile options
 * - Search bar for filtering jobs by title, company, or notes
 * - Collapsible status sections for organized job viewing
 * - Stats cards showing total jobs, today's count, and daily goal
 * 
 * Requirements:
 * - 1.1: Display job applications grouped by status in collapsible sections
 * - 1.6: Display status sections in priority order
 * - 2.1: Display a Global_Search bar prominently at the top
 * - 2.5: Show matching jobs in a flat list with status badges when searching
 */

import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, LayoutAnimation, Platform, UIManager, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useJobs } from '../../features/jobs/hooks/useJobs';
import { useGoal } from '../../features/user/hooks/useGoal';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { groupJobsByStatus, STATUS_DISPLAY_ORDER, filterJobsBySearch, getJobCountsByStatus } from '../../features/jobs/utils/jobUtils';
import { Job, JobStatus } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius, statusColors } from '../../theme';
import { CollapsibleStatusSection } from '../../components/dashboard/CollapsibleStatusSection';
import { StatusStats } from '../../components/dashboard/StatusStats';
import { AcceptedJobBanner } from '../../components/dashboard/AcceptedJobBanner';
import { ProfileSidebar } from '../../components/dashboard/ProfileSidebar';
import { LimitBanner } from '../../components/ui/LimitBanner';
import { UpgradePrompt } from '../../components/ui/UpgradePrompt';
import { NotificationIcon } from '../../components/ui/NotificationIcon';
import { useNotificationStore } from '../../store/notificationStore';
import { getStoredUser } from '../../features/auth/services/authService';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DashboardScreen() {
  const { jobs, isLoading, refetch, deleteJob } = useJobs();
  const { dailyGoal } = useGoal();
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [storedUser, setStoredUser] = useState<{ name?: string | null; image?: string | null } | null>(null);
  const searchInputRef = useRef<TextInput>(null);
  
  // Load stored user for profile icon
  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await getStoredUser();
      setStoredUser(userData);
    };
    loadUser();
  }, []);
  
  // Get unread notification count from store (Requirements 1.1, 1.2)
  const unreadCount = useNotificationStore((state) => state.getUnreadCount());
  
  // Track expanded/collapsed state for each status section
  const [expandedSections, setExpandedSections] = useState<Record<JobStatus, boolean>>({
    [JobStatus.ACCEPTED]: true,
    [JobStatus.OFFERED]: true,
    [JobStatus.INTERVIEWING]: true,
    [JobStatus.APPLIED]: true,
    [JobStatus.PENDING]: false,
    [JobStatus.REJECTED]: false,
  });
  
  // State for upgrade prompt visibility
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Filter jobs based on search query
  const filteredJobs = filterJobsBySearch(jobs, searchQuery);
  const isSearching = searchQuery.trim().length > 0;
  
  // Group jobs by status (only used when not searching)
  const jobsByStatus = groupJobsByStatus(filteredJobs);
  
  // Get counts for status stats
  const statusCounts = getJobCountsByStatus(jobs);
  
  // Find accepted job for banner
  const acceptedJob = jobs.find(job => job.status === JobStatus.ACCEPTED);

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

  // Handle delete accepted job
  const handleDeleteAcceptedJob = useCallback(async (jobId: string) => {
    try {
      await deleteJob(jobId);
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  }, [deleteJob]);

  // Toggle expanded/collapsed state for a status section
  const handleToggleSection = useCallback((status: JobStatus) => {
    setExpandedSections(prev => ({
      ...prev,
      [status]: !prev[status],
    }));
  }, []);

  // Handle search query change
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Toggle search expansion
  const handleSearchToggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSearchExpanded(prev => {
      if (!prev) {
        // Expanding - focus the input after animation
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      } else {
        // Collapsing - clear the search query
        setSearchQuery('');
      }
      return !prev;
    });
  }, []);

  // Close search when pressing back/cancel
  const handleSearchClose = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSearchExpanded(false);
    setSearchQuery('');
  }, []);

  // Handle notification icon press - open notification center (Requirement 1.4)
  const handleNotificationPress = useCallback(() => {
    router.push('/modals/notifications');
  }, [router]);

  // Handle status card press - scroll to that section
  const handleStatusPress = useCallback((status: JobStatus) => {
    // Expand the section if collapsed
    setExpandedSections(prev => ({
      ...prev,
      [status]: true,
    }));
    // Could add scroll-to functionality here
  }, []);

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
      {/* Header with expandable search */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {isSearchExpanded ? (
          // Expanded search bar
          <View style={styles.expandedSearchContainer}>
            <TouchableOpacity 
              onPress={handleSearchClose}
              style={styles.searchBackButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={[styles.searchInputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textTertiary} style={styles.searchInputIcon} />
              <TextInput
                ref={searchInputRef}
                style={[styles.searchInput, { color: colors.text }]}
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder="Search jobs..."
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          // Normal header with profile icon, notification icon, and search icon
          <>
            <TouchableOpacity 
              onPress={() => setIsSidebarVisible(true)}
              style={styles.profileButton}
              activeOpacity={0.7}
            >
              <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
                {storedUser?.image ? (
                  <Image source={{ uri: storedUser.image }} style={styles.profileAvatarImage} />
                ) : (
                  <Text style={styles.profileAvatarText}>
                    {storedUser?.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <NotificationIcon
                unreadCount={unreadCount}
                onPress={handleNotificationPress}
              />
              <TouchableOpacity 
                onPress={handleSearchToggle}
                style={[styles.searchIconButton, { backgroundColor: colors.backgroundSecondary }]}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <Ionicons name="search" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </>
        )}
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
            {/* Status Stats - Shows counts for statuses with applications */}
            {jobs.length > 0 && (
              <StatusStats 
                statusCounts={statusCounts} 
                onStatusPress={handleStatusPress}
              />
            )}

            {/* Limit Banner - Shows usage for Free tier users (Requirement 1.3) */}
            <View style={styles.limitBannerContainer}>
              <LimitBanner 
                entityType="jobs"
                entityLabel="jobs"
                onUpgradePress={() => setShowUpgradePrompt(true)}
              />
            </View>

            {/* Daily Progress */}
            <View style={[styles.progressContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.progressHeader}>
                <View style={styles.progressTitleRow}>
                  <Text style={[styles.progressTitle, { color: colors.text }]}>Today's Progress</Text>
                  <TouchableOpacity onPress={handleGoalPress}>
                    <Text style={[styles.goalLink, { color: colors.primary }]}>
                      Goal: {dailyGoal}
                    </Text>
                  </TouchableOpacity>
                </View>
                {isGoalReached && (
                  <View style={[styles.goalBadge, { backgroundColor: colors.success }]}>
                    <Ionicons name="checkmark-circle" size={14} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={styles.goalBadgeText}>Goal Reached!</Text>
                  </View>
                )}
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
                {todayJobs.length} / {dailyGoal} applications today
              </Text>
            </View>

            {/* Accepted Job Banner */}
            {acceptedJob && (
              <AcceptedJobBanner 
                job={acceptedJob} 
                onPress={handleJobPress}
                onDelete={handleDeleteAcceptedJob}
              />
            )}

            {/* Empty State */}
            {jobs.length === 0 && (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
                  <Ionicons name="briefcase-outline" size={32} color={colors.textTertiary} />
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

            {/* Jobs by Status - Collapsible Sections (excluding ACCEPTED - shown in banner) */}
            {jobs.length > 0 && !isSearching && (
              <View style={styles.jobsSection}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Applications by Status</Text>
                {STATUS_DISPLAY_ORDER.filter(status => status !== JobStatus.ACCEPTED).map((status) => {
                  const statusJobs = jobsByStatus[status];
                  // Only show sections that have jobs
                  if (statusJobs.length === 0) return null;
                  
                  return (
                    <CollapsibleStatusSection
                      key={status}
                      status={status}
                      jobs={statusJobs}
                      isExpanded={expandedSections[status]}
                      onToggle={() => handleToggleSection(status)}
                      onJobPress={handleJobPress}
                    />
                  );
                })}
              </View>
            )}

            {/* Search Results - Flat list with status badges (excluding ACCEPTED) */}
            {jobs.length > 0 && isSearching && (
              <View style={styles.jobsSection}>
                {(() => {
                  const nonAcceptedResults = filteredJobs.filter((job: Job) => job.status !== JobStatus.ACCEPTED);
                  return (
                    <>
                      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        Search Results ({nonAcceptedResults.length})
                      </Text>
                      {nonAcceptedResults.length > 0 ? (
                        nonAcceptedResults.map((job: Job) => {
                          const statusColor = getStatusColor(job.status);
                          return (
                            <TouchableOpacity
                              key={job.id}
                              style={[styles.jobCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                              onPress={() => handleJobPress(job.id)}
                            >
                              <View style={[styles.jobAccent, { backgroundColor: statusColor }]} />
                              <View style={styles.jobContent}>
                                <View style={styles.jobHeader}>
                                  <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={1}>{job.title}</Text>
                                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>{job.status}</Text>
                                  </View>
                                </View>
                                <Text style={[styles.jobCompany, { color: colors.textSecondary }]}>{job.company}</Text>
                              </View>
                              <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
                            </TouchableOpacity>
                          );
                        })
                      ) : (
                        <View style={styles.searchEmptyState}>
                          <View style={[styles.searchEmptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
                            <Ionicons name="search-outline" size={32} color={colors.textTertiary} />
                          </View>
                          <Text style={[styles.searchEmptyTitle, { color: colors.text }]}>
                            No results found
                          </Text>
                          <Text style={[styles.searchEmptyMessage, { color: colors.textSecondary }]}>
                            No jobs match "{searchQuery}"
                          </Text>
                          <Text style={[styles.searchEmptyHint, { color: colors.textTertiary }]}>
                            Try adjusting your search or check for typos
                          </Text>
                        </View>
                      )}
                    </>
                  );
                })()}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={handleAddJob}>
        <Text style={[styles.fabText, { color: colors.textInverse }]}>+</Text>
      </TouchableOpacity>

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        visible={showUpgradePrompt}
        onDismiss={() => setShowUpgradePrompt(false)}
        entityType="jobs"
      />

      {/* Profile Sidebar */}
      <ProfileSidebar
        visible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
      />
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
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    minHeight: 64,
  },
  profileButton: {
    padding: spacing.xs,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileAvatarImage: {
    width: 40,
    height: 40,
  },
  profileAvatarText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBackButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInputIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  progressContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  limitBannerContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  progressHeader: {
    marginBottom: spacing.md,
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  goalLink: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  goalBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
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
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  jobTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    flex: 1,
  },
  jobCompany: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  statusBadgeText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    textTransform: 'capitalize',
  },
  chevron: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize['2xl'],
    paddingRight: spacing.md,
  },
  noResultsContainer: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  noResultsText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    marginBottom: spacing.xs,
  },
  noResultsHint: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  searchEmptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },
  searchEmptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  searchEmptyTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    marginBottom: spacing.sm,
  },
  searchEmptyMessage: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  searchEmptyHint: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    textAlign: 'center',
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
