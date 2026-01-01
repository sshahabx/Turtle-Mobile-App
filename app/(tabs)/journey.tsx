/**
 * Journey Tab Screen
 *
 * Main screen for the Career Journey (Forest Map) feature.
 * Integrates JourneyMap with journey store and handles milestone interactions.
 *
 * Requirements:
 * - 1.1: Journey_Map SHALL be accessible as a top-level tab (auth-only)
 * - 2.1: Journey_Map SHALL render as vertically scrollable view
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useJourneyStore } from '../../store/journeyStore';
import { useJobs } from '../../features/jobs/hooks/useJobs';
import { JourneyMap } from '../../components/journey/JourneyMap';
import { NodeOverlay } from '../../components/journey/NodeOverlay';
import { getMilestoneState } from '../../features/journey/utils/milestoneUtils';
import { fontFamily, fontSize, spacing } from '../../theme';
import type { Milestone } from '../../types/journey';
import { JobStatus } from '../../types';

/**
 * Calculate user statistics from jobs for milestone state calculation
 */
function calculateStats(jobs: Array<{ status: string }>) {
  return {
    totalApplications: jobs.length,
    totalInterviews: jobs.filter(j => 
      j.status === JobStatus.INTERVIEWING || 
      j.status === JobStatus.OFFERED || 
      j.status === JobStatus.ACCEPTED
    ).length,
    totalOffers: jobs.filter(j => 
      j.status === JobStatus.OFFERED || 
      j.status === JobStatus.ACCEPTED
    ).length,
    acceptedJobs: jobs.filter(j => j.status === JobStatus.ACCEPTED).length,
  };
}

export default function JourneyScreen() {
  const { colors } = useTheme();
  const { jobs, isLoading: jobsLoading } = useJobs();
  
  // Journey store state and actions
  const journeyState = useJourneyStore((state) => state.journeyState);
  const isLoading = useJourneyStore((state) => state.isLoading);
  const initializeJourneyState = useJourneyStore((state) => state.initializeJourneyState);
  const saveReflection = useJourneyStore((state) => state.saveReflection);
  
  // Selected milestone for overlay
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);

  // Initialize journey state if not present
  useEffect(() => {
    if (!journeyState && !isLoading) {
      initializeJourneyState();
    }
  }, [journeyState, isLoading, initializeJourneyState]);

  // Calculate stats from jobs
  const stats = calculateStats(jobs);

  // Handle milestone press - show overlay
  const handleMilestonePress = useCallback((milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setOverlayVisible(true);
  }, []);

  // Handle overlay close
  const handleOverlayClose = useCallback(() => {
    setOverlayVisible(false);
    // Delay clearing selected milestone to allow animation
    setTimeout(() => setSelectedMilestone(null), 200);
  }, []);

  // Handle reflection save
  const handleReflectionSave = useCallback((text: string) => {
    if (selectedMilestone) {
      saveReflection(selectedMilestone.id, text);
    }
  }, [selectedMilestone, saveReflection]);

  // Loading state
  if (isLoading || jobsLoading || !journeyState) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your journey...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Determine if selected milestone is locked
  const isSelectedMilestoneLocked = selectedMilestone 
    ? getMilestoneState(selectedMilestone, stats) === 'locked'
    : false;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <JourneyMap
        journeyState={journeyState}
        stats={stats}
        onMilestonePress={handleMilestonePress}
      />

      {/* Milestone overlay */}
      {selectedMilestone && (
        <NodeOverlay
          milestone={selectedMilestone}
          visible={overlayVisible}
          isLocked={isSelectedMilestoneLocked}
          onClose={handleOverlayClose}
          onReflectionSave={handleReflectionSave}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    marginTop: spacing.md,
  },
});
