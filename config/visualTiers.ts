/**
 * Visual Tier Configuration
 * 
 * Defines the visual tier thresholds for the Career Journey feature.
 * Visual tiers determine the environmental theme of the journey map
 * based on the user's career score.
 */

import type { VisualTier } from '../types/journey';

/**
 * Point thresholds for each visual tier.
 * Users progress through tiers as their career score increases.
 * 
 * - seedling (0): Starting state
 * - sapling (100): ~10 jobs or 20 tasks/habits
 * - grove (500): Sustained engagement
 * - forest (1500): Long-term dedication
 */
export const VISUAL_TIER_THRESHOLDS: Record<VisualTier, number> = {
  seedling: 0,
  sapling: 100,
  grove: 500,
  forest: 1500,
};

/**
 * Ordered array of visual tiers from lowest to highest.
 */
export const VISUAL_TIER_ORDER: VisualTier[] = ['seedling', 'sapling', 'grove', 'forest'];

/**
 * Get the visual tier for a given career score.
 * Returns the highest tier where the score meets or exceeds the threshold.
 * 
 * @param score - The user's career score
 * @returns The visual tier corresponding to the score
 */
export function getVisualTier(score: number): VisualTier {
  if (score >= VISUAL_TIER_THRESHOLDS.forest) return 'forest';
  if (score >= VISUAL_TIER_THRESHOLDS.grove) return 'grove';
  if (score >= VISUAL_TIER_THRESHOLDS.sapling) return 'sapling';
  return 'seedling';
}

/**
 * Get the next visual tier after the current one.
 * Returns null if already at the highest tier.
 * 
 * @param currentTier - The current visual tier
 * @returns The next tier or null if at max
 */
export function getNextVisualTier(currentTier: VisualTier): VisualTier | null {
  const currentIndex = VISUAL_TIER_ORDER.indexOf(currentTier);
  if (currentIndex === -1 || currentIndex >= VISUAL_TIER_ORDER.length - 1) {
    return null;
  }
  return VISUAL_TIER_ORDER[currentIndex + 1];
}

/**
 * Get the points needed to reach the next visual tier.
 * Returns null if already at the highest tier.
 * 
 * @param currentScore - The user's current career score
 * @returns Points needed for next tier or null if at max
 */
export function getPointsToNextTier(currentScore: number): number | null {
  const currentTier = getVisualTier(currentScore);
  const nextTier = getNextVisualTier(currentTier);
  
  if (!nextTier) return null;
  
  return VISUAL_TIER_THRESHOLDS[nextTier] - currentScore;
}
