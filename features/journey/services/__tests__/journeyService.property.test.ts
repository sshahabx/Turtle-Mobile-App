/**
 * Property-Based Tests for Journey Service
 *
 * Feature: career-journey
 *
 * These tests verify the journey service's state serialization and
 * persistence correctness using property-based testing with fast-check.
 */

import * as fc from 'fast-check';
import {
  JourneyState,
  JourneyLevel,
  Milestone,
  VisualTier,
  MilestoneType,
} from '../../../../types/journey';
import {
  serializeJourneyState,
  deserializeJourneyState,
  createInitialJourneyState,
} from '../../../../store/journeyStore';
import { MILESTONE_TYPES } from '../../../../config/milestones';

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

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
 * Generator for JourneyState with specific constraints for edge cases
 */
const journeyStateWithReflectionsArb: fc.Arbitrary<JourneyState> = fc.record({
  currentLevel: journeyLevelArb,
  completedLevels: fc.array(journeyLevelArb, { minLength: 0, maxLength: 5 }),
  milestones: fc.array(
    fc.record({
      id: fc.uuid(),
      type: milestoneTypeArb,
      title: fc.string({ minLength: 1, maxLength: 50 }),
      description: fc.string({ minLength: 1, maxLength: 200 }),
      threshold: fc.integer({ min: 1, max: 100 }),
      unlockedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
      reflection: fc.string({ minLength: 1, maxLength: 500 }),
    }),
    { minLength: 1, maxLength: 7 }
  ),
  careerScore: fc.integer({ min: 0, max: 10000 }),
  visualTier: visualTierArb,
});

// ============================================================================
// Helper Functions for Testing
// ============================================================================

/**
 * Compares two JourneyLevel objects for equality
 */
function levelsEqual(a: JourneyLevel, b: JourneyLevel): boolean {
  return (
    a.id === b.id &&
    a.levelNumber === b.levelNumber &&
    a.title === b.title &&
    a.startedAt.getTime() === b.startedAt.getTime() &&
    (a.completedAt?.getTime() ?? null) === (b.completedAt?.getTime() ?? null) &&
    a.acceptedJobId === b.acceptedJobId
  );
}

/**
 * Compares two Milestone objects for equality
 */
function milestonesEqual(a: Milestone, b: Milestone): boolean {
  return (
    a.id === b.id &&
    a.type === b.type &&
    a.title === b.title &&
    a.description === b.description &&
    a.threshold === b.threshold &&
    (a.unlockedAt?.getTime() ?? null) === (b.unlockedAt?.getTime() ?? null) &&
    a.reflection === b.reflection
  );
}

/**
 * Compares two JourneyState objects for equality
 */
function journeyStatesEqual(a: JourneyState, b: JourneyState): boolean {
  if (a.careerScore !== b.careerScore) return false;
  if (a.visualTier !== b.visualTier) return false;
  if (!levelsEqual(a.currentLevel, b.currentLevel)) return false;
  if (a.completedLevels.length !== b.completedLevels.length) return false;
  if (a.milestones.length !== b.milestones.length) return false;

  for (let i = 0; i < a.completedLevels.length; i++) {
    if (!levelsEqual(a.completedLevels[i], b.completedLevels[i])) return false;
  }

  for (let i = 0; i < a.milestones.length; i++) {
    if (!milestonesEqual(a.milestones[i], b.milestones[i])) return false;
  }

  return true;
}

/**
 * Simulates full JSON round-trip (like AsyncStorage would do)
 */
function fullJsonRoundTrip(state: JourneyState): JourneyState {
  const serialized = serializeJourneyState(state);
  const jsonString = JSON.stringify(serialized);
  const parsed = JSON.parse(jsonString);
  return deserializeJourneyState(parsed);
}

// ============================================================================
// Property Tests
// ============================================================================

describe('Journey Service Property Tests', () => {
  /**
   * Property 13: Journey State Round-Trip Serialization
   *
   * For any valid JourneyState object, serializing to JSON then deserializing
   * SHALL produce an equivalent object.
   *
   * **Validates: Requirements 8.1, 8.2**
   */
  describe('Property 13: Journey State Round-Trip Serialization', () => {
    it('should produce equivalent state after full JSON round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const roundTripped = fullJsonRoundTrip(state);

          // Property: round-trip should produce equivalent state
          expect(journeyStatesEqual(state, roundTripped)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve careerScore exactly through round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const roundTripped = fullJsonRoundTrip(state);

          // Property: careerScore should be exactly preserved
          expect(roundTripped.careerScore).toBe(state.careerScore);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve visualTier exactly through round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const roundTripped = fullJsonRoundTrip(state);

          // Property: visualTier should be exactly preserved
          expect(roundTripped.visualTier).toBe(state.visualTier);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve currentLevel.id through round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const roundTripped = fullJsonRoundTrip(state);

          // Property: currentLevel.id should be preserved
          expect(roundTripped.currentLevel.id).toBe(state.currentLevel.id);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve currentLevel.levelNumber through round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const roundTripped = fullJsonRoundTrip(state);

          // Property: currentLevel.levelNumber should be preserved
          expect(roundTripped.currentLevel.levelNumber).toBe(state.currentLevel.levelNumber);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve currentLevel.title through round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const roundTripped = fullJsonRoundTrip(state);

          // Property: currentLevel.title should be preserved
          expect(roundTripped.currentLevel.title).toBe(state.currentLevel.title);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve currentLevel.startedAt as Date through round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const roundTripped = fullJsonRoundTrip(state);

          // Property: startedAt should be a Date with same timestamp
          expect(roundTripped.currentLevel.startedAt instanceof Date).toBe(true);
          expect(roundTripped.currentLevel.startedAt.getTime()).toBe(
            state.currentLevel.startedAt.getTime()
          );
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve currentLevel.completedAt through round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const roundTripped = fullJsonRoundTrip(state);

          if (state.currentLevel.completedAt) {
            // Property: completedAt should be a Date with same timestamp
            expect(roundTripped.currentLevel.completedAt instanceof Date).toBe(true);
            expect(roundTripped.currentLevel.completedAt!.getTime()).toBe(
              state.currentLevel.completedAt.getTime()
            );
          } else {
            // Property: undefined should remain undefined
            expect(roundTripped.currentLevel.completedAt).toBeUndefined();
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve completedLevels array length through round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const roundTripped = fullJsonRoundTrip(state);

          // Property: completedLevels length should be preserved
          expect(roundTripped.completedLevels.length).toBe(state.completedLevels.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve all completedLevels data through round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const roundTripped = fullJsonRoundTrip(state);

          // Property: each completed level should be equivalent
          state.completedLevels.forEach((level, index) => {
            expect(levelsEqual(level, roundTripped.completedLevels[index])).toBe(true);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve milestones array length through round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const roundTripped = fullJsonRoundTrip(state);

          // Property: milestones length should be preserved
          expect(roundTripped.milestones.length).toBe(state.milestones.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve milestone.type through round-trip', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const roundTripped = fullJsonRoundTrip(state);

          // Property: each milestone type should be preserved
          state.milestones.forEach((milestone, index) => {
            expect(roundTripped.milestones[index].type).toBe(milestone.type);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve milestone.reflection through round-trip', () => {
      fc.assert(
        fc.property(journeyStateWithReflectionsArb, (state) => {
          const roundTripped = fullJsonRoundTrip(state);

          // Property: each milestone reflection should be preserved
          state.milestones.forEach((milestone, index) => {
            expect(roundTripped.milestones[index].reflection).toBe(milestone.reflection);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve milestone.unlockedAt as Date through round-trip', () => {
      fc.assert(
        fc.property(journeyStateWithReflectionsArb, (state) => {
          const roundTripped = fullJsonRoundTrip(state);

          // Property: each milestone unlockedAt should be a Date with same timestamp
          state.milestones.forEach((milestone, index) => {
            if (milestone.unlockedAt) {
              expect(roundTripped.milestones[index].unlockedAt instanceof Date).toBe(true);
              expect(roundTripped.milestones[index].unlockedAt!.getTime()).toBe(
                milestone.unlockedAt.getTime()
              );
            }
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should handle initial journey state round-trip correctly', () => {
      const initialState = createInitialJourneyState();
      const roundTripped = fullJsonRoundTrip(initialState);

      // Property: initial state should round-trip correctly
      expect(roundTripped.careerScore).toBe(0);
      expect(roundTripped.visualTier).toBe('seedling');
      expect(roundTripped.currentLevel.levelNumber).toBe(0);
      expect(roundTripped.currentLevel.title).toBe('Job Hunt');
      expect(roundTripped.completedLevels.length).toBe(0);
      expect(roundTripped.milestones.length).toBe(MILESTONE_TYPES.length);
    });

    it('should handle empty completedLevels array', () => {
      fc.assert(
        fc.property(
          fc.record({
            currentLevel: journeyLevelArb,
            completedLevels: fc.constant([]),
            milestones: fc.array(milestoneArb, { minLength: 0, maxLength: 7 }),
            careerScore: fc.integer({ min: 0, max: 10000 }),
            visualTier: visualTierArb,
          }),
          (state) => {
            const roundTripped = fullJsonRoundTrip(state);

            // Property: empty array should remain empty
            expect(roundTripped.completedLevels).toEqual([]);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty milestones array', () => {
      fc.assert(
        fc.property(
          fc.record({
            currentLevel: journeyLevelArb,
            completedLevels: fc.array(journeyLevelArb, { minLength: 0, maxLength: 5 }),
            milestones: fc.constant([]),
            careerScore: fc.integer({ min: 0, max: 10000 }),
            visualTier: visualTierArb,
          }),
          (state) => {
            const roundTripped = fullJsonRoundTrip(state);

            // Property: empty array should remain empty
            expect(roundTripped.milestones).toEqual([]);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be idempotent (multiple round-trips produce same result)', () => {
      fc.assert(
        fc.property(journeyStateArb, (state) => {
          const roundTripped1 = fullJsonRoundTrip(state);
          const roundTripped2 = fullJsonRoundTrip(roundTripped1);
          const roundTripped3 = fullJsonRoundTrip(roundTripped2);

          // Property: multiple round-trips should produce equivalent results
          expect(journeyStatesEqual(roundTripped1, roundTripped2)).toBe(true);
          expect(journeyStatesEqual(roundTripped2, roundTripped3)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });
});
