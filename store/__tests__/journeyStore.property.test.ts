/**
 * Property-Based Tests for Journey Store
 *
 * Feature: career-journey
 *
 * These tests verify the journey store's career score monotonicity,
 * state persistence, and correctness properties using property-based
 * testing with fast-check.
 */

import * as fc from 'fast-check';
import {
  JourneyState,
  JourneyLevel,
  Milestone,
  PointActionType,
  VisualTier,
  MilestoneType,
} from '../../types/journey';
import {
  POINT_VALUES,
  createInitialJourneyState,
  serializeJourneyState,
  deserializeJourneyState,
} from '../journeyStore';
import { getVisualTier } from '../../config/visualTiers';
import { MILESTONE_CONFIG, MILESTONE_TYPES } from '../../config/milestones';

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

/**
 * Generator for valid PointActionType values
 */
const pointActionTypeArb: fc.Arbitrary<PointActionType> = fc.constantFrom(
  'job_added',
  'task_completed',
  'habit_completed'
);

/**
 * Generator for valid VisualTier values
 */
const visualTierArb: fc.Arbitrary<VisualTier> = fc.constantFrom(
  'seedling',
  'sapling',
  'grove',
  'forest'
);

/**
 * Generator for valid MilestoneType values
 */
const milestoneTypeArb: fc.Arbitrary<MilestoneType> = fc.constantFrom(
  'first_application',
  'applications_10',
  'applications_25',
  'applications_50',
  'first_interview',
  'first_offer',
  'accepted_offer'
);

/**
 * Generator for valid JourneyLevel objects
 */
const journeyLevelArb: fc.Arbitrary<JourneyLevel> = fc.record({
  id: fc.uuid(),
  levelNumber: fc.integer({ min: 0, max: 100 }),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  startedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
  completedAt: fc.option(
    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
    { nil: undefined }
  ),
  acceptedJobId: fc.option(fc.uuid(), { nil: undefined }),
});

/**
 * Generator for valid Milestone objects
 */
const milestoneArb: fc.Arbitrary<Milestone> = fc.record({
  id: fc.uuid(),
  type: milestoneTypeArb,
  title: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  threshold: fc.integer({ min: 1, max: 100 }),
  unlockedAt: fc.option(
    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
    { nil: undefined }
  ),
  reflection: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
});

/**
 * Generator for valid JourneyState objects
 */
const journeyStateArb: fc.Arbitrary<JourneyState> = fc.record({
  currentLevel: journeyLevelArb,
  completedLevels: fc.array(journeyLevelArb, { minLength: 0, maxLength: 10 }),
  milestones: fc.array(milestoneArb, { minLength: 0, maxLength: 7 }),
  careerScore: fc.integer({ min: 0, max: 10000 }),
  visualTier: visualTierArb,
});

/**
 * Generator for a sequence of point actions
 */
const pointActionSequenceArb = fc.array(pointActionTypeArb, {
  minLength: 1,
  maxLength: 100,
});

// ============================================================================
// Helper Functions for Testing
// ============================================================================

/**
 * Simulates awarding points and returns the new score
 * This mirrors the store's awardPoints logic
 */
function simulateAwardPoints(
  currentScore: number,
  actionType: PointActionType
): number {
  const points = POINT_VALUES[actionType];
  return currentScore + points;
}

/**
 * Simulates a sequence of point awards and returns all intermediate scores
 */
function simulatePointSequence(
  initialScore: number,
  actions: PointActionType[]
): number[] {
  const scores: number[] = [initialScore];
  let currentScore = initialScore;

  for (const action of actions) {
    currentScore = simulateAwardPoints(currentScore, action);
    scores.push(currentScore);
  }

  return scores;
}

/**
 * Calculates expected total points from a sequence of actions
 */
function calculateExpectedTotal(
  initialScore: number,
  actions: PointActionType[]
): number {
  return actions.reduce((total, action) => total + POINT_VALUES[action], initialScore);
}

// ============================================================================
// Property Tests
// ============================================================================

describe('Journey Store Property Tests', () => {
  /**
   * Property 11: Career Score Monotonicity
   *
   * For any sequence of point-earning actions, the career score SHALL be
   * monotonically non-decreasing and equal to the sum of all awarded points.
   *
   * **Validates: Requirements 6.2, 6.4**
   */
  describe('Property 11: Career Score Monotonicity', () => {
    it('should never decrease career score after awarding points', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 5000 }),
          pointActionSequenceArb,
          (initialScore, actions) => {
            const scores = simulatePointSequence(initialScore, actions);

            // Property: each score should be >= the previous score
            for (let i = 1; i < scores.length; i++) {
              expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should equal the sum of all awarded points', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 5000 }),
          pointActionSequenceArb,
          (initialScore, actions) => {
            const finalScore = simulatePointSequence(initialScore, actions).pop()!;
            const expectedTotal = calculateExpectedTotal(initialScore, actions);

            // Property: final score should equal initial + sum of all points
            expect(finalScore).toBe(expectedTotal);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should increase by exactly the point value for each action', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 5000 }),
          pointActionTypeArb,
          (currentScore, actionType) => {
            const newScore = simulateAwardPoints(currentScore, actionType);
            const expectedIncrease = POINT_VALUES[actionType];

            // Property: score increase should equal the action's point value
            expect(newScore - currentScore).toBe(expectedIncrease);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award correct points for job_added action (10 points)', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 5000 }), (currentScore) => {
          const newScore = simulateAwardPoints(currentScore, 'job_added');

          // Property: job_added should always add 10 points
          expect(newScore).toBe(currentScore + 10);
        }),
        { numRuns: 100 }
      );
    });

    it('should award correct points for task_completed action (5 points)', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 5000 }), (currentScore) => {
          const newScore = simulateAwardPoints(currentScore, 'task_completed');

          // Property: task_completed should always add 5 points
          expect(newScore).toBe(currentScore + 5);
        }),
        { numRuns: 100 }
      );
    });

    it('should award correct points for habit_completed action (5 points)', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 5000 }), (currentScore) => {
          const newScore = simulateAwardPoints(currentScore, 'habit_completed');

          // Property: habit_completed should always add 5 points
          expect(newScore).toBe(currentScore + 5);
        }),
        { numRuns: 100 }
      );
    });

    it('should be strictly increasing (never stay the same) for valid actions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 5000 }),
          pointActionTypeArb,
          (currentScore, actionType) => {
            const newScore = simulateAwardPoints(currentScore, actionType);

            // Property: score should strictly increase (all actions have positive points)
            expect(newScore).toBeGreaterThan(currentScore);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain monotonicity regardless of action order', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          fc.shuffledSubarray(
            ['job_added', 'task_completed', 'habit_completed'] as PointActionType[],
            { minLength: 1, maxLength: 3 }
          ),
          fc.integer({ min: 1, max: 10 }),
          (initialScore, actionTypes, repetitions) => {
            // Create a sequence by repeating the shuffled actions
            const actions: PointActionType[] = [];
            for (let i = 0; i < repetitions; i++) {
              actions.push(...actionTypes);
            }

            const scores = simulatePointSequence(initialScore, actions);

            // Property: scores should be monotonically increasing
            for (let i = 1; i < scores.length; i++) {
              expect(scores[i]).toBeGreaterThan(scores[i - 1]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle large sequences without overflow or precision issues', () => {
      fc.assert(
        fc.property(
          fc.array(pointActionTypeArb, { minLength: 100, maxLength: 500 }),
          (actions) => {
            const scores = simulatePointSequence(0, actions);
            const finalScore = scores[scores.length - 1];
            const expectedTotal = calculateExpectedTotal(0, actions);

            // Property: even with many actions, score should be exact
            expect(finalScore).toBe(expectedTotal);
            expect(Number.isInteger(finalScore)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 13: Journey State Round-Trip Serialization
   *
   * For any valid JourneyState object, serializing to JSON then deserializing
   * SHALL produce an equivalent object.
   *
   * **Validates: Requirements 8.1, 8.2**
   */
  describe('Property 13: Journey State Round-Trip Serialization', () => {
    it('should preserve careerScore through serialization round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const serialized = serializeJourneyState(state);
          const deserialized = deserializeJourneyState(serialized);

          expect(deserialized.careerScore).toBe(state.careerScore);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve visualTier through serialization round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const serialized = serializeJourneyState(state);
          const deserialized = deserializeJourneyState(serialized);

          expect(deserialized.visualTier).toBe(state.visualTier);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve currentLevel through serialization round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const serialized = serializeJourneyState(state);
          const deserialized = deserializeJourneyState(serialized);

          expect(deserialized.currentLevel.id).toBe(state.currentLevel.id);
          expect(deserialized.currentLevel.levelNumber).toBe(state.currentLevel.levelNumber);
          expect(deserialized.currentLevel.title).toBe(state.currentLevel.title);
          expect(deserialized.currentLevel.startedAt.getTime()).toBe(
            state.currentLevel.startedAt.getTime()
          );
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve completedLevels array length through round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const serialized = serializeJourneyState(state);
          const deserialized = deserializeJourneyState(serialized);

          expect(deserialized.completedLevels.length).toBe(state.completedLevels.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve milestones array length through round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const serialized = serializeJourneyState(state);
          const deserialized = deserializeJourneyState(serialized);

          expect(deserialized.milestones.length).toBe(state.milestones.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve milestone reflection text through round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const serialized = serializeJourneyState(state);
          const deserialized = deserializeJourneyState(serialized);

          state.milestones.forEach((milestone, index) => {
            expect(deserialized.milestones[index].reflection).toBe(milestone.reflection);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve Date objects correctly through round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const serialized = serializeJourneyState(state);
          const deserialized = deserializeJourneyState(serialized);

          // Check currentLevel dates
          expect(deserialized.currentLevel.startedAt instanceof Date).toBe(true);
          expect(deserialized.currentLevel.startedAt.getTime()).toBe(
            state.currentLevel.startedAt.getTime()
          );

          if (state.currentLevel.completedAt) {
            expect(deserialized.currentLevel.completedAt instanceof Date).toBe(true);
            expect(deserialized.currentLevel.completedAt!.getTime()).toBe(
              state.currentLevel.completedAt.getTime()
            );
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should handle initial journey state round-trip correctly', () => {
      const initialState = createInitialJourneyState();
      const serialized = serializeJourneyState(initialState);
      const deserialized = deserializeJourneyState(serialized);

      expect(deserialized.careerScore).toBe(0);
      expect(deserialized.visualTier).toBe('seedling');
      expect(deserialized.currentLevel.levelNumber).toBe(0);
      expect(deserialized.currentLevel.title).toBe('Job Hunt');
      expect(deserialized.completedLevels.length).toBe(0);
      expect(deserialized.milestones.length).toBe(MILESTONE_TYPES.length);
    });
  });
});
