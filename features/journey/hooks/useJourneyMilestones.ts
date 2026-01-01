/**
 * useJourneyMilestones Hook
 *
 * Provides milestone checking and unlocking functionality for the Career Journey feature.
 * Automatically checks and unlocks milestones based on user activity statistics.
 *
 * Requirements:
 * - 4.2: Unlock milestones when corresponding activity is completed
 * - 4.3: Unlock milestones with subtle animation when achieved
 */

import { useCallback, useMemo } from 'react';
import { JobStatus } from '../../../types';
import type { JourneyStats, Milestone, MilestoneType } from '../../../types/journey';
import { useJourneyStore } from '../../../store/journeyStore';
import { journeyService } from '../services/journeyService';
import { checkMilestoneUnlock } from '../utils/milestoneUtils';
import { MILESTONE_TYPES } from '../../../config/milestones';

/**
 * Props for jobs data used to calculate journey stats
 */
interface Job {
  id: string;
  status: JobStatus;
}

/**
 * Hook for managing journey milestones
 *
 * @returns Object containing milestone state and check functions
 */
export function useJourneyMilestones() {
  const journeyState = useJourneyStore((state) => state.journeyState);
  const unlockMilestone = useJourneyStore((state) => state.unlockMilestone);

  /**
   * Calculates journey statistics from jobs data
   */
  const calculateStats = useCallback((jobs: Job[]): JourneyStats => {
    return {
      totalApplications: jobs.length,
      totalInterviews: jobs.filter(
        (job) =>
          job.status === JobStatus.INTERVIEWING ||
          job.status === JobStatus.OFFERED ||
          job.status === JobStatus.ACCEPTED
      ).length,
      totalOffers: jobs.filter(
        (job) =>
          job.status === JobStatus.OFFERED || job.status === JobStatus.ACCEPTED
      ).length,
      acceptedJobs: jobs.filter((job) => job.status === JobStatus.ACCEPTED)
        .length,
    };
  }, []);

  /**
   * Checks and unlocks any milestones that should be unlocked based on current stats
   *
   * @param jobs - Array of jobs to calculate stats from
   * @returns Array of newly unlocked milestone types
   */
  const checkAndUnlockMilestones = useCallback(
    async (jobs: Job[]): Promise<MilestoneType[]> => {
      if (!journeyState) {
        return [];
      }

      const stats = calculateStats(jobs);
      const newlyUnlocked: MilestoneType[] = [];

      for (const milestoneType of MILESTONE_TYPES) {
        // Find the milestone in current state
        const milestone = journeyState.milestones.find(
          (m) => m.type === milestoneType
        );

        // Skip if already unlocked
        if (milestone?.unlockedAt) {
          continue;
        }

        // Check if milestone should be unlocked
        if (checkMilestoneUnlock(milestoneType, stats)) {
          try {
            await journeyService.unlockMilestone(milestoneType);
            newlyUnlocked.push(milestoneType);
          } catch (error) {
            console.error(`Failed to unlock milestone ${milestoneType}:`, error);
          }
        }
      }

      return newlyUnlocked;
    },
    [journeyState, calculateStats]
  );

  /**
   * Checks milestones after a job is added
   *
   * @param jobs - Updated array of jobs after addition
   */
  const checkMilestonesOnJobAdd = useCallback(
    async (jobs: Job[]): Promise<MilestoneType[]> => {
      return checkAndUnlockMilestones(jobs);
    },
    [checkAndUnlockMilestones]
  );

  /**
   * Checks milestones after a job status change
   *
   * @param jobs - Updated array of jobs after status change
   * @param newStatus - The new status that was set
   */
  const checkMilestonesOnStatusChange = useCallback(
    async (jobs: Job[], newStatus: JobStatus): Promise<MilestoneType[]> => {
      // Only check milestones for status changes that could unlock new milestones
      const relevantStatuses = [
        JobStatus.INTERVIEWING,
        JobStatus.OFFERED,
        JobStatus.ACCEPTED,
      ];

      if (!relevantStatuses.includes(newStatus)) {
        return [];
      }

      return checkAndUnlockMilestones(jobs);
    },
    [checkAndUnlockMilestones]
  );

  /**
   * Gets the current milestones from journey state
   */
  const milestones = useMemo((): Milestone[] => {
    return journeyState?.milestones ?? [];
  }, [journeyState]);

  /**
   * Gets unlocked milestones
   */
  const unlockedMilestones = useMemo((): Milestone[] => {
    return milestones.filter((m) => m.unlockedAt);
  }, [milestones]);

  /**
   * Gets locked milestones
   */
  const lockedMilestones = useMemo((): Milestone[] => {
    return milestones.filter((m) => !m.unlockedAt);
  }, [milestones]);

  return {
    milestones,
    unlockedMilestones,
    lockedMilestones,
    calculateStats,
    checkAndUnlockMilestones,
    checkMilestonesOnJobAdd,
    checkMilestonesOnStatusChange,
  };
}

export default useJourneyMilestones;
