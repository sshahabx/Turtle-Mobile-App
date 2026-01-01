/**
 * Milestone Configuration
 * 
 * Defines all 7 milestone types for the Career Journey feature,
 * including their thresholds and unlock check functions.
 */

import type { MilestoneType, MilestoneDefinition, JourneyStats } from '../types/journey';

/**
 * Configuration for all milestone types in the Career Journey.
 * Each milestone has a title, description, threshold, check function, and hint.
 */
export const MILESTONE_CONFIG: Record<MilestoneType, MilestoneDefinition> = {
  first_application: {
    title: 'First Step',
    description: 'Added your first job application',
    threshold: 1,
    checkFn: (stats: JourneyStats) => stats.totalApplications >= 1,
    hint: 'Add your first job application to unlock this milestone',
  },
  applications_10: {
    title: 'Building Momentum',
    description: 'Reached 10 job applications',
    threshold: 10,
    checkFn: (stats: JourneyStats) => stats.totalApplications >= 10,
    hint: 'Add 10 job applications to unlock this milestone',
  },
  applications_25: {
    title: 'Steady Progress',
    description: 'Reached 25 job applications',
    threshold: 25,
    checkFn: (stats: JourneyStats) => stats.totalApplications >= 25,
    hint: 'Add 25 job applications to unlock this milestone',
  },
  applications_50: {
    title: 'Dedicated Seeker',
    description: 'Reached 50 job applications',
    threshold: 50,
    checkFn: (stats: JourneyStats) => stats.totalApplications >= 50,
    hint: 'Add 50 job applications to unlock this milestone',
  },
  first_interview: {
    title: 'Making Connections',
    description: 'Reached your first interview',
    threshold: 1,
    checkFn: (stats: JourneyStats) => stats.totalInterviews >= 1,
    hint: 'Get your first interview to unlock this milestone',
  },
  first_offer: {
    title: 'Recognition',
    description: 'Received your first job offer',
    threshold: 1,
    checkFn: (stats: JourneyStats) => stats.totalOffers >= 1,
    hint: 'Receive your first job offer to unlock this milestone',
  },
  accepted_offer: {
    title: 'New Chapter',
    description: 'Accepted a job offer',
    threshold: 1,
    checkFn: (stats: JourneyStats) => stats.acceptedJobs >= 1,
    hint: 'Accept a job offer to unlock this milestone',
  },
};

/**
 * Array of all milestone types in display order.
 */
export const MILESTONE_TYPES: MilestoneType[] = [
  'first_application',
  'applications_10',
  'applications_25',
  'applications_50',
  'first_interview',
  'first_offer',
  'accepted_offer',
];

/**
 * Get the milestone definition for a given type.
 */
export function getMilestoneDefinition(type: MilestoneType): MilestoneDefinition {
  return MILESTONE_CONFIG[type];
}

/**
 * Check if a milestone should be unlocked based on user stats.
 */
export function shouldUnlockMilestone(type: MilestoneType, stats: JourneyStats): boolean {
  const definition = MILESTONE_CONFIG[type];
  return definition.checkFn(stats);
}
