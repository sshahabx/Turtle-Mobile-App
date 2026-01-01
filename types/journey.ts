/**
 * Journey Type Definitions
 * 
 * Types for the Career Journey (Forest Map) feature that provides
 * a calm, narrative-driven visualization of a user's job search progression.
 */

// ============================================================================
// Visual Tier Types
// ============================================================================

/**
 * Visual tiers represent the environmental theme of the journey map
 * based on career score thresholds.
 */
export type VisualTier = 'seedling' | 'sapling' | 'grove' | 'forest';

// ============================================================================
// Level Types
// ============================================================================

/**
 * Represents a chapter in the user's career journey.
 * Each accepted job marks the completion of a level.
 */
export interface JourneyLevel {
  /** Unique identifier for the level */
  id: string;
  /** Sequential level number (0, 1, 2, etc.) */
  levelNumber: number;
  /** Display title for the level */
  title: string;
  /** When the level was started */
  startedAt: Date;
  /** When the level was completed (job accepted) */
  completedAt?: Date;
  /** ID of the accepted job that completed this level */
  acceptedJobId?: string;
}

// ============================================================================
// Milestone Types
// ============================================================================

/**
 * Types of milestones that can be achieved on the journey.
 */
export type MilestoneType =
  | 'first_application'
  | 'applications_10'
  | 'applications_25'
  | 'applications_50'
  | 'first_interview'
  | 'first_offer'
  | 'accepted_offer';

/**
 * Visual state of a milestone node on the journey map.
 */
export type MilestoneState = 'locked' | 'unlocked' | 'current';

/**
 * Represents a milestone achievement on the journey path.
 */
export interface Milestone {
  /** Unique identifier for the milestone */
  id: string;
  /** Type of milestone */
  type: MilestoneType;
  /** Display title for the milestone */
  title: string;
  /** Description of the achievement */
  description: string;
  /** Threshold value required to unlock */
  threshold: number;
  /** When the milestone was unlocked */
  unlockedAt?: Date;
  /** Optional user reflection text */
  reflection?: string;
}

// ============================================================================
// Point Action Types
// ============================================================================

/**
 * Types of actions that can earn career score points.
 */
export type PointActionType = 'job_added' | 'task_completed' | 'habit_completed';

/**
 * Represents a point-earning action in the journey.
 */
export interface PointAction {
  /** Type of action that earned points */
  type: PointActionType;
  /** Number of points awarded */
  points: number;
  /** When the action occurred */
  timestamp: Date;
}

// ============================================================================
// Journey State Types
// ============================================================================

/**
 * Complete state of a user's career journey.
 */
export interface JourneyState {
  /** Current active level */
  currentLevel: JourneyLevel;
  /** Array of completed levels (historical chapters) */
  completedLevels: JourneyLevel[];
  /** Array of all milestones with their current state */
  milestones: Milestone[];
  /** Cumulative career score */
  careerScore: number;
  /** Current visual tier based on career score */
  visualTier: VisualTier;
}

// ============================================================================
// Statistics Types (for milestone checks)
// ============================================================================

/**
 * User statistics used for milestone unlock checks.
 */
export interface JourneyStats {
  /** Total number of job applications */
  totalApplications: number;
  /** Total number of interviews */
  totalInterviews: number;
  /** Total number of offers received */
  totalOffers: number;
  /** Total number of accepted jobs */
  acceptedJobs: number;
}

// ============================================================================
// Milestone Configuration Types
// ============================================================================

/**
 * Definition for a milestone type including its unlock criteria.
 */
export interface MilestoneDefinition {
  /** Display title */
  title: string;
  /** Description of the achievement */
  description: string;
  /** Threshold value for unlocking */
  threshold: number;
  /** Function to check if milestone should be unlocked */
  checkFn: (stats: JourneyStats) => boolean;
  /** Hint text shown when milestone is locked */
  hint: string;
}
