/**
 * Property-Based Tests for Milestone Utilities
 *
 * Feature: career-journey
 *
 * These tests verify milestone state correctness, lock state validation,
 * and hint availability using property-based testing with fast-check.
 */

import * as fc from 'fast-check';
import type {
  Milestone,
  MilestoneType,
  MilestoneState,
  JourneyStats,
} from '../../../../types/journey';
import { MILESTONE_CONFIG, MILESTONE_TYPES } from '../../../../config/milestones';
import {
  getMilestoneState,
  checkMilestoneUnlock,
  getMilestoneHint,
  isMilestoneLocked,
  getMilestoneThreshold,
  getRelevantStatForMilestone,
} from '../milestoneUtils';

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

/**
 * Generator for valid MilestoneType values
 */
const milestoneTypeArb: fc.Arbitrary<MilestoneType> = fc.constantFrom(
  ...MILESTONE_TYPES
);

/**
 * Generator for JourneyStats with non-negative integer values
 */
const journeyStatsArb: fc.Arbitrary<JourneyStats> = fc.record({
  totalApplications: fc.nat({ max: 1000 }),
  totalInterviews: fc.nat({ max: 100 }),
  totalOffers: fc.nat({ max: 50 }),
  acceptedJobs: fc.nat({ max: 20 }),
});

/**
 * Generator for a Milestone object
 */
const milestoneArb: fc.Arbitrary<Milestone> = milestoneTypeArb.chain((type) => {
  const definition = MILESTONE_CONFIG[type];
  return fc.record({
    id: fc.uuid(),
    type: fc.constant(type),
    title: fc.constant(definition.title),
    description: fc.constant(definition.description),
    threshold: fc.constant(definition.threshold),
    unlockedAt: fc.option(fc.date(), { nil: undefined }),
    reflection: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
  });
});

/**
 * Generator for a Milestone that is definitely locked (no unlockedAt)
 */
const lockedMilestoneArb: fc.Arbitrary<Milestone> = milestoneTypeArb.chain((type) => {
  const definition = MILESTONE_CONFIG[type];
  return fc.record({
    id: fc.uuid(),
    type: fc.constant(type),
    title: fc.constant(definition.title),
    description: fc.constant(definition.description),
    threshold: fc.constant(definition.threshold),
    unlockedAt: fc.constant(undefined),
    reflection: fc.constant(undefined),
  });
});

// ============================================================================
// Property Tests
// ============================================================================

describe('Milestone Utils Property Tests', () => {
  /**
   * Property 6: Milestone Lock State Correctness
   *
   * For any milestone with threshold T and user activity count C,
   * the milestone SHALL be locked if and only if C < T.
   *
   * **Validates: Requirements 4.2**
   */
  describe('Property 6: Milestone Lock State Correctness', () => {
    it('should lock milestone when relevant stat is below threshold', () => {
      fc.assert(
        fc.property(milestoneTypeArb, (milestoneType) => {
          const threshold = getMilestoneThreshold(milestoneType);

          // Create stats where relevant stat is below threshold
          const stats: JourneyStats = {
            totalApplications: 0,
            totalInterviews: 0,
            totalOffers: 0,
            acceptedJobs: 0,
          };

          // Property: milestone should be locked when stat < threshold
          const isLocked = isMilestoneLocked(milestoneType, stats);
          expect(isLocked).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should unlock milestone when relevant stat meets threshold', () => {
      fc.assert(
        fc.property(milestoneTypeArb, (milestoneType) => {
          const threshold = getMilestoneThreshold(milestoneType);

          // Create stats where relevant stat meets threshold
          const stats: JourneyStats = {
            totalApplications: threshold >= 50 ? threshold : 50,
            totalInterviews: threshold,
            totalOffers: threshold,
            acceptedJobs: threshold,
          };

          // Property: milestone should be unlocked when stat >= threshold
          const isLocked = isMilestoneLocked(milestoneType, stats);
          expect(isLocked).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should correctly determine lock state based on threshold comparison', () => {
      fc.assert(
        fc.property(
          milestoneTypeArb,
          journeyStatsArb,
          (milestoneType, stats) => {
            const threshold = getMilestoneThreshold(milestoneType);
            const relevantStat = getRelevantStatForMilestone(milestoneType, stats);
            const isLocked = isMilestoneLocked(milestoneType, stats);

            // Property: locked if and only if relevantStat < threshold
            if (relevantStat < threshold) {
              expect(isLocked).toBe(true);
            } else {
              expect(isLocked).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have checkMilestoneUnlock return opposite of isMilestoneLocked', () => {
      fc.assert(
        fc.property(
          milestoneTypeArb,
          journeyStatsArb,
          (milestoneType, stats) => {
            const isLocked = isMilestoneLocked(milestoneType, stats);
            const shouldUnlock = checkMilestoneUnlock(milestoneType, stats);

            // Property: checkMilestoneUnlock should be the inverse of isMilestoneLocked
            expect(shouldUnlock).toBe(!isLocked);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should unlock application milestones at correct thresholds', () => {
      const applicationMilestones: Array<{ type: MilestoneType; threshold: number }> = [
        { type: 'first_application', threshold: 1 },
        { type: 'applications_10', threshold: 10 },
        { type: 'applications_25', threshold: 25 },
        { type: 'applications_50', threshold: 50 },
      ];

      applicationMilestones.forEach(({ type, threshold }) => {
        // Just below threshold - should be locked
        const statsBelowThreshold: JourneyStats = {
          totalApplications: threshold - 1,
          totalInterviews: 0,
          totalOffers: 0,
          acceptedJobs: 0,
        };
        expect(isMilestoneLocked(type, statsBelowThreshold)).toBe(true);

        // At threshold - should be unlocked
        const statsAtThreshold: JourneyStats = {
          totalApplications: threshold,
          totalInterviews: 0,
          totalOffers: 0,
          acceptedJobs: 0,
        };
        expect(isMilestoneLocked(type, statsAtThreshold)).toBe(false);

        // Above threshold - should be unlocked
        const statsAboveThreshold: JourneyStats = {
          totalApplications: threshold + 10,
          totalInterviews: 0,
          totalOffers: 0,
          acceptedJobs: 0,
        };
        expect(isMilestoneLocked(type, statsAboveThreshold)).toBe(false);
      });
    });

    it('should unlock interview milestone at correct threshold', () => {
      const belowThreshold: JourneyStats = {
        totalApplications: 100,
        totalInterviews: 0,
        totalOffers: 0,
        acceptedJobs: 0,
      };
      expect(isMilestoneLocked('first_interview', belowThreshold)).toBe(true);

      const atThreshold: JourneyStats = {
        totalApplications: 100,
        totalInterviews: 1,
        totalOffers: 0,
        acceptedJobs: 0,
      };
      expect(isMilestoneLocked('first_interview', atThreshold)).toBe(false);
    });

    it('should unlock offer milestone at correct threshold', () => {
      const belowThreshold: JourneyStats = {
        totalApplications: 100,
        totalInterviews: 10,
        totalOffers: 0,
        acceptedJobs: 0,
      };
      expect(isMilestoneLocked('first_offer', belowThreshold)).toBe(true);

      const atThreshold: JourneyStats = {
        totalApplications: 100,
        totalInterviews: 10,
        totalOffers: 1,
        acceptedJobs: 0,
      };
      expect(isMilestoneLocked('first_offer', atThreshold)).toBe(false);
    });

    it('should unlock accepted offer milestone at correct threshold', () => {
      const belowThreshold: JourneyStats = {
        totalApplications: 100,
        totalInterviews: 10,
        totalOffers: 5,
        acceptedJobs: 0,
      };
      expect(isMilestoneLocked('accepted_offer', belowThreshold)).toBe(true);

      const atThreshold: JourneyStats = {
        totalApplications: 100,
        totalInterviews: 10,
        totalOffers: 5,
        acceptedJobs: 1,
      };
      expect(isMilestoneLocked('accepted_offer', atThreshold)).toBe(false);
    });
  });


  /**
   * Property 7: Milestone State Validity
   *
   * For any milestone, its computed state SHALL be exactly one of:
   * 'locked', 'unlocked', or 'current'.
   *
   * **Validates: Requirements 4.5**
   */
  describe('Property 7: Milestone State Validity', () => {
    const validStates: MilestoneState[] = ['locked', 'unlocked', 'current'];

    it('should always return a valid milestone state', () => {
      fc.assert(
        fc.property(
          milestoneArb,
          journeyStatsArb,
          fc.option(milestoneTypeArb, { nil: undefined }),
          (milestone, stats, currentMilestoneType) => {
            const state = getMilestoneState(milestone, stats, currentMilestoneType);

            // Property: state must be exactly one of the valid states
            expect(validStates).toContain(state);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return "current" when milestone type matches currentMilestoneType', () => {
      fc.assert(
        fc.property(
          lockedMilestoneArb,
          journeyStatsArb,
          (milestone, stats) => {
            // Set current milestone type to match the milestone
            const state = getMilestoneState(milestone, stats, milestone.type);

            // Property: should be 'current' when types match
            expect(state).toBe('current');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return "unlocked" when milestone has unlockedAt date', () => {
      fc.assert(
        fc.property(
          milestoneTypeArb,
          journeyStatsArb,
          fc.date(),
          (milestoneType, stats, unlockedAt) => {
            const definition = MILESTONE_CONFIG[milestoneType];
            const milestone: Milestone = {
              id: 'test-id',
              type: milestoneType,
              title: definition.title,
              description: definition.description,
              threshold: definition.threshold,
              unlockedAt: unlockedAt,
            };

            // Use a different milestone type as current to avoid 'current' state
            const differentType = MILESTONE_TYPES.find((t) => t !== milestoneType);
            const state = getMilestoneState(milestone, stats, differentType);

            // Property: should be 'unlocked' when unlockedAt is set
            expect(state).toBe('unlocked');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return "locked" when milestone has no unlockedAt and stats below threshold', () => {
      fc.assert(
        fc.property(milestoneTypeArb, (milestoneType) => {
          const definition = MILESTONE_CONFIG[milestoneType];
          const milestone: Milestone = {
            id: 'test-id',
            type: milestoneType,
            title: definition.title,
            description: definition.description,
            threshold: definition.threshold,
            unlockedAt: undefined,
          };

          // Stats with all zeros - below all thresholds
          const stats: JourneyStats = {
            totalApplications: 0,
            totalInterviews: 0,
            totalOffers: 0,
            acceptedJobs: 0,
          };

          // Use a different milestone type as current
          const differentType = MILESTONE_TYPES.find((t) => t !== milestoneType);
          const state = getMilestoneState(milestone, stats, differentType);

          // Property: should be 'locked' when no unlockedAt and stats below threshold
          expect(state).toBe('locked');
        }),
        { numRuns: 100 }
      );
    });

    it('should return "unlocked" when stats meet threshold even without unlockedAt', () => {
      fc.assert(
        fc.property(milestoneTypeArb, (milestoneType) => {
          const definition = MILESTONE_CONFIG[milestoneType];
          const threshold = definition.threshold;
          const milestone: Milestone = {
            id: 'test-id',
            type: milestoneType,
            title: definition.title,
            description: definition.description,
            threshold: threshold,
            unlockedAt: undefined,
          };

          // Stats that meet all thresholds
          const stats: JourneyStats = {
            totalApplications: Math.max(50, threshold),
            totalInterviews: threshold,
            totalOffers: threshold,
            acceptedJobs: threshold,
          };

          // Use a different milestone type as current
          const differentType = MILESTONE_TYPES.find((t) => t !== milestoneType);
          const state = getMilestoneState(milestone, stats, differentType);

          // Property: should be 'unlocked' when stats meet threshold
          expect(state).toBe('unlocked');
        }),
        { numRuns: 100 }
      );
    });

    it('should never return an invalid state string', () => {
      fc.assert(
        fc.property(
          milestoneArb,
          journeyStatsArb,
          fc.option(milestoneTypeArb, { nil: undefined }),
          (milestone, stats, currentMilestoneType) => {
            const state = getMilestoneState(milestone, stats, currentMilestoneType);

            // Property: state should be a string and one of the valid values
            expect(typeof state).toBe('string');
            expect(['locked', 'unlocked', 'current']).toContain(state);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have mutually exclusive states', () => {
      fc.assert(
        fc.property(
          milestoneArb,
          journeyStatsArb,
          fc.option(milestoneTypeArb, { nil: undefined }),
          (milestone, stats, currentMilestoneType) => {
            const state = getMilestoneState(milestone, stats, currentMilestoneType);

            // Property: exactly one state should be true
            const isLocked = state === 'locked';
            const isUnlocked = state === 'unlocked';
            const isCurrent = state === 'current';

            const trueCount = [isLocked, isUnlocked, isCurrent].filter(Boolean).length;
            expect(trueCount).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 9: Locked Milestone Hint Availability
   *
   * For any locked milestone, there SHALL exist a non-empty hint string
   * describing how to unlock it.
   *
   * **Validates: Requirements 5.5**
   */
  describe('Property 9: Locked Milestone Hint Availability', () => {
    it('should return non-empty hint for all milestone types', () => {
      fc.assert(
        fc.property(milestoneTypeArb, (milestoneType) => {
          const hint = getMilestoneHint(milestoneType);

          // Property: hint should be a non-empty string
          expect(typeof hint).toBe('string');
          expect(hint.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should return hint that describes unlock action', () => {
      fc.assert(
        fc.property(milestoneTypeArb, (milestoneType) => {
          const hint = getMilestoneHint(milestoneType);

          // Property: hint should contain actionable language
          // Hints should mention what action to take
          const hasActionableContent =
            hint.toLowerCase().includes('add') ||
            hint.toLowerCase().includes('get') ||
            hint.toLowerCase().includes('receive') ||
            hint.toLowerCase().includes('accept') ||
            hint.toLowerCase().includes('reach') ||
            hint.toLowerCase().includes('unlock') ||
            hint.toLowerCase().includes('progress');

          expect(hasActionableContent).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should have unique hints for each milestone type', () => {
      const hints = MILESTONE_TYPES.map((type) => getMilestoneHint(type));
      const uniqueHints = new Set(hints);

      // Property: each milestone should have a unique hint
      expect(uniqueHints.size).toBe(MILESTONE_TYPES.length);
    });

    it('should return consistent hint for same milestone type', () => {
      fc.assert(
        fc.property(milestoneTypeArb, (milestoneType) => {
          const hint1 = getMilestoneHint(milestoneType);
          const hint2 = getMilestoneHint(milestoneType);

          // Property: same milestone type should always return same hint
          expect(hint1).toBe(hint2);
        }),
        { numRuns: 100 }
      );
    });

    it('should have hints that match milestone config', () => {
      MILESTONE_TYPES.forEach((milestoneType) => {
        const hint = getMilestoneHint(milestoneType);
        const configHint = MILESTONE_CONFIG[milestoneType].hint;

        // Property: hint should match the configured hint
        expect(hint).toBe(configHint);
      });
    });

    it('should return default hint for invalid milestone type', () => {
      const invalidType = 'invalid_milestone' as MilestoneType;
      const hint = getMilestoneHint(invalidType);

      // Property: should return a non-empty default hint for invalid types
      expect(typeof hint).toBe('string');
      expect(hint.length).toBeGreaterThan(0);
    });

    it('should have hints that are reasonable length', () => {
      fc.assert(
        fc.property(milestoneTypeArb, (milestoneType) => {
          const hint = getMilestoneHint(milestoneType);

          // Property: hints should be between 10 and 200 characters
          expect(hint.length).toBeGreaterThanOrEqual(10);
          expect(hint.length).toBeLessThanOrEqual(200);
        }),
        { numRuns: 100 }
      );
    });
  });
});
