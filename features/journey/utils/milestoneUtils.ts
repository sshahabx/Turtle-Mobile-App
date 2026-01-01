/**
 * Milestone Utility Functions
 *
 * Provides utility functions for managing milestone states, checking unlock
 * conditions, and generating hints for locked milestones.
 *
 * Requirements: 4.2, 4.5, 5.5
 */

import type {
  Milestone,
  MilestoneType,
  MilestoneState,
  JourneyStats,
} from '../../../types/journey';
import { MILESTONE_CONFIG } from '../../../config/milestones';

/**
 * Determines the visual state of a milestone based on user stats and current progress.
 *
 * @param milestone - The milestone to check
 * @param stats - Current user journey statistics
 * @param currentMilestoneType - The type of the current active milestone (if any)
 * @returns The computed MilestoneState: 'locked', 'unlocked', or 'current'
 *
 * Requirements: 4.5 - Milestone SHALL display distinct visual state for locked, unlocked, and current
 */
export function getMilestoneState(
  milestone: Milestone,
  stats: JourneyStats,
  currentMilestoneType?: MilestoneType
): MilestoneState {
  // Check if this is the current milestone
  if (currentMilestoneType && milestone.type === currentMilestoneType) {
    return 'current';
  }

  // Check if milestone is unlocked (has unlockedAt date or meets threshold)
  if (milestone.unlockedAt) {
    return 'unlocked';
  }

  // Check if milestone should be unlocked based on stats
  const definition = MILESTONE_CONFIG[milestone.type];
  if (definition && definition.checkFn(stats)) {
    return 'unlocked';
  }

  return 'locked';
}

/**
 * Checks if a milestone should be unlocked based on user statistics.
 *
 * @param milestoneType - The type of milestone to check
 * @param stats - Current user journey statistics
 * @returns true if the milestone should be unlocked, false otherwise
 *
 * Requirements: 4.2 - Milestone SHALL remain locked until corresponding activity is completed
 */
export function checkMilestoneUnlock(
  milestoneType: MilestoneType,
  stats: JourneyStats
): boolean {
  const definition = MILESTONE_CONFIG[milestoneType];

  if (!definition) {
    return false;
  }

  return definition.checkFn(stats);
}

/**
 * Gets the hint text for a locked milestone explaining how to unlock it.
 *
 * @param milestoneType - The type of milestone to get hint for
 * @returns The hint string, or a default message if milestone type is invalid
 *
 * Requirements: 5.5 - IF user taps locked Milestone, THEN System SHALL display subtle hint
 */
export function getMilestoneHint(milestoneType: MilestoneType): string {
  const definition = MILESTONE_CONFIG[milestoneType];

  if (!definition) {
    return 'Keep progressing on your journey to unlock this milestone';
  }

  return definition.hint;
}

/**
 * Checks if a milestone is locked based on threshold and user stats.
 * A milestone is locked if and only if the user's relevant stat count
 * is less than the milestone's threshold.
 *
 * @param milestoneType - The type of milestone to check
 * @param stats - Current user journey statistics
 * @returns true if the milestone is locked, false if unlocked
 *
 * Requirements: 4.2 - Milestone SHALL remain locked until corresponding activity is completed
 */
export function isMilestoneLocked(
  milestoneType: MilestoneType,
  stats: JourneyStats
): boolean {
  return !checkMilestoneUnlock(milestoneType, stats);
}

/**
 * Gets the threshold value for a milestone type.
 *
 * @param milestoneType - The type of milestone
 * @returns The threshold value, or 0 if milestone type is invalid
 */
export function getMilestoneThreshold(milestoneType: MilestoneType): number {
  const definition = MILESTONE_CONFIG[milestoneType];
  return definition?.threshold ?? 0;
}

/**
 * Gets the relevant stat value for a milestone type from user stats.
 *
 * @param milestoneType - The type of milestone
 * @param stats - Current user journey statistics
 * @returns The relevant stat count for the milestone
 */
export function getRelevantStatForMilestone(
  milestoneType: MilestoneType,
  stats: JourneyStats
): number {
  switch (milestoneType) {
    case 'first_application':
    case 'applications_10':
    case 'applications_25':
    case 'applications_50':
      return stats.totalApplications;
    case 'first_interview':
      return stats.totalInterviews;
    case 'first_offer':
      return stats.totalOffers;
    case 'accepted_offer':
      return stats.acceptedJobs;
    default:
      return 0;
  }
}
