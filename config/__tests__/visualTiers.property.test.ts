/**
 * Property-Based Tests for Visual Tier Configuration
 * 
 * Feature: career-journey
 * 
 * These tests verify the visual tier calculation functions
 * using property-based testing with fast-check.
 */

import * as fc from 'fast-check';
import {
  VISUAL_TIER_THRESHOLDS,
  VISUAL_TIER_ORDER,
  getVisualTier,
  getNextVisualTier,
  getPointsToNextTier,
} from '../visualTiers';
import type { VisualTier } from '../../types/journey';

describe('visualTiers Property Tests', () => {
  /**
   * Property 12: Visual Tier Threshold Correctness
   * 
   * For any career score S, the computed visual tier SHALL match
   * the highest threshold T where S >= T.
   * 
   * **Validates: Requirements 7.1**
   */
  describe('Property 12: Visual Tier Threshold Correctness', () => {
    it('should return the highest tier where score meets or exceeds threshold', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 5000 }),
          (score) => {
            const tier = getVisualTier(score);
            
            // Property: tier threshold must be <= score
            expect(VISUAL_TIER_THRESHOLDS[tier]).toBeLessThanOrEqual(score);
            
            // Property: no higher tier should have threshold <= score
            const tierIndex = VISUAL_TIER_ORDER.indexOf(tier);
            for (let i = tierIndex + 1; i < VISUAL_TIER_ORDER.length; i++) {
              const higherTier = VISUAL_TIER_ORDER[i];
              expect(VISUAL_TIER_THRESHOLDS[higherTier]).toBeGreaterThan(score);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always return a valid VisualTier', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: 10000 }),
          (score) => {
            const tier = getVisualTier(score);
            
            // Property: result must be a valid visual tier
            expect(VISUAL_TIER_ORDER).toContain(tier);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return seedling for scores below sapling threshold', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: VISUAL_TIER_THRESHOLDS.sapling - 1 }),
          (score) => {
            const tier = getVisualTier(score);
            
            // Property: scores below 100 must be seedling
            expect(tier).toBe('seedling');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return sapling for scores in sapling range', () => {
      fc.assert(
        fc.property(
          fc.integer({ 
            min: VISUAL_TIER_THRESHOLDS.sapling, 
            max: VISUAL_TIER_THRESHOLDS.grove - 1 
          }),
          (score) => {
            const tier = getVisualTier(score);
            
            // Property: scores 100-499 must be sapling
            expect(tier).toBe('sapling');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return grove for scores in grove range', () => {
      fc.assert(
        fc.property(
          fc.integer({ 
            min: VISUAL_TIER_THRESHOLDS.grove, 
            max: VISUAL_TIER_THRESHOLDS.forest - 1 
          }),
          (score) => {
            const tier = getVisualTier(score);
            
            // Property: scores 500-1499 must be grove
            expect(tier).toBe('grove');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return forest for scores at or above forest threshold', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: VISUAL_TIER_THRESHOLDS.forest, max: 10000 }),
          (score) => {
            const tier = getVisualTier(score);
            
            // Property: scores 1500+ must be forest
            expect(tier).toBe('forest');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be monotonically non-decreasing with score', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 5000 }),
          fc.integer({ min: 0, max: 5000 }),
          (score1, score2) => {
            const tier1 = getVisualTier(score1);
            const tier2 = getVisualTier(score2);
            const index1 = VISUAL_TIER_ORDER.indexOf(tier1);
            const index2 = VISUAL_TIER_ORDER.indexOf(tier2);
            
            // Property: higher score should never result in lower tier
            if (score1 <= score2) {
              expect(index1).toBeLessThanOrEqual(index2);
            }
            if (score2 <= score1) {
              expect(index2).toBeLessThanOrEqual(index1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle negative scores by returning seedling', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: -1 }),
          (score) => {
            const tier = getVisualTier(score);
            
            // Property: negative scores should return seedling (lowest tier)
            expect(tier).toBe('seedling');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('getNextVisualTier', () => {
    it('should return the next tier in order or null for forest', () => {
      const tiers: VisualTier[] = ['seedling', 'sapling', 'grove', 'forest'];
      
      tiers.forEach((tier, index) => {
        const nextTier = getNextVisualTier(tier);
        if (index < tiers.length - 1) {
          expect(nextTier).toBe(tiers[index + 1]);
        } else {
          expect(nextTier).toBeNull();
        }
      });
    });
  });

  describe('getPointsToNextTier', () => {
    it('should return correct points needed for next tier', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: VISUAL_TIER_THRESHOLDS.forest - 1 }),
          (score) => {
            const pointsNeeded = getPointsToNextTier(score);
            const currentTier = getVisualTier(score);
            const nextTier = getNextVisualTier(currentTier);
            
            // Property: points needed should equal next threshold minus current score
            if (nextTier) {
              expect(pointsNeeded).toBe(VISUAL_TIER_THRESHOLDS[nextTier] - score);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return null for scores at or above forest threshold', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: VISUAL_TIER_THRESHOLDS.forest, max: 10000 }),
          (score) => {
            const pointsNeeded = getPointsToNextTier(score);
            
            // Property: no next tier for forest level
            expect(pointsNeeded).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
