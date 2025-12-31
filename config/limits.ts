/**
 * Free Tier Limits Configuration
 * 
 * Defines the maximum number of items a Free Tier user can create
 * for each entity type. Premium (authenticated) users have unlimited access.
 */

/**
 * Limits for each entity type in Free Tier mode
 */
export interface EntityLimits {
  jobs: number;
  notes: number;
  tasks: number;
  habits: number;
}

/**
 * Free tier limits configuration
 * - Jobs: 10 applications
 * - Notes: 5 notes
 * - Tasks: 10 tasks
 * - Habits: 3 habits
 */
export const FREE_TIER_LIMITS: EntityLimits = {
  jobs: 10,
  notes: 5,
  tasks: 10,
  habits: 3,
};

/**
 * Entity types that have limits applied
 */
export type EntityType = keyof EntityLimits;

/**
 * Status of a user's usage against their tier limits
 */
export interface LimitStatus {
  /** Current number of items the user has created */
  currentCount: number;
  /** Maximum number of items allowed (Infinity for Premium tier) */
  maxLimit: number;
  /** Whether the user can create a new item */
  canCreate: boolean;
  /** Usage as a percentage (0-100), clamped */
  usagePercentage: number;
  /** Whether the user has reached their limit */
  isAtLimit: boolean;
}
