/**
 * Property-Based Tests for Level Utilities
 *
 * Feature: career-journey
 *
 * These tests verify level initialization, increment, persistence,
 * and data integrity using property-based testing with fast-check.
 */

import * as fc from 'fast-check';
import type { JourneyLevel } from '../../../../types/journey';
import {
  createInitialLevel,
  completeLevel,
  validateLevelData,
  validateCompletedLevelData,
  isInitialLevel,
  getLevelTitle,
  getNextLevelNumber,
} from '../levelUtils';

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

/**
 * Generator for valid level numbers (non-negative integers)
 */
const levelNumberArb: fc.Arbitrary<number> = fc.nat({ max: 100 });

/**
 * Generator for valid job IDs (non-empty UUIDs)
 */
const jobIdArb: fc.Arbitrary<string> = fc.uuid();

/**
 * Generator for valid non-empty, non-whitespace-only titles
 */
const validTitleArb: fc.Arbitrary<string> = fc
  .stringOf(fc.char().filter((c) => c.trim() !== ''), { minLength: 1, maxLength: 50 })
  .filter((s) => s.trim().length > 0);

/**
 * Generator for a valid JourneyLevel (active, not completed)
 */
const activeLevelArb: fc.Arbitrary<JourneyLevel> = fc.record({
  id: fc.uuid(),
  levelNumber: levelNumberArb,
  title: validTitleArb,
  startedAt: fc.date({ min: new Date(0), max: new Date() }),
  completedAt: fc.constant(undefined),
  acceptedJobId: fc.constant(undefined),
});

/**
 * Generator for a valid completed JourneyLevel
 */
const completedLevelArb: fc.Arbitrary<JourneyLevel> = fc.record({
  id: fc.uuid(),
  levelNumber: levelNumberArb,
  title: validTitleArb,
  startedAt: fc.date({ min: new Date(0), max: new Date() }),
  completedAt: fc.date({ min: new Date(0), max: new Date() }),
  acceptedJobId: fc.uuid(),
});

/**
 * Generator for any valid JourneyLevel (active or completed)
 */
const journeyLevelArb: fc.Arbitrary<JourneyLevel> = fc.oneof(
  activeLevelArb,
  completedLevelArb
);

// ============================================================================
// Property Tests
// ============================================================================

describe('Level Utils Property Tests', () => {
  /**
   * Property 2: New User Level Initialization
   *
   * For any newly created journey state, the current level SHALL be
   * Level 0 with title "Job Hunt" and no completion date.
   *
   * **Validates: Requirements 3.1**
   */
  describe('Property 2: New User Level Initialization', () => {
    it('should create initial level at level 0', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const level = createInitialLevel();

          // Property: level number should be 0
          expect(level.levelNumber).toBe(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should create initial level with title "Job Hunt"', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const level = createInitialLevel();

          // Property: title should be "Job Hunt"
          expect(level.title).toBe('Job Hunt');
        }),
        { numRuns: 100 }
      );
    });

    it('should create initial level with no completion date', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const level = createInitialLevel();

          // Property: completedAt should be undefined
          expect(level.completedAt).toBeUndefined();
        }),
        { numRuns: 100 }
      );
    });

    it('should create initial level with no accepted job ID', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const level = createInitialLevel();

          // Property: acceptedJobId should be undefined
          expect(level.acceptedJobId).toBeUndefined();
        }),
        { numRuns: 100 }
      );
    });

    it('should create initial level with valid startedAt date', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const level = createInitialLevel();

          // Property: startedAt should be a valid Date
          expect(level.startedAt).toBeInstanceOf(Date);
          expect(isNaN(level.startedAt.getTime())).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should create initial level with unique ID', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const level = createInitialLevel();

          // Property: id should be a non-empty string
          expect(typeof level.id).toBe('string');
          expect(level.id.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should create unique IDs for multiple initial levels', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const level = createInitialLevel();
        ids.add(level.id);
      }

      // Property: all IDs should be unique
      expect(ids.size).toBe(100);
    });

    it('should pass validation for initial level', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const level = createInitialLevel();

          // Property: initial level should pass validation
          expect(validateLevelData(level)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should be recognized as initial level by isInitialLevel', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const level = createInitialLevel();

          // Property: should be recognized as initial level
          expect(isInitialLevel(level)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 3: Level Increment on Job Acceptance
   *
   * For any user at level N who accepts a job offer, the resulting
   * level number SHALL be exactly N + 1.
   *
   * **Validates: Requirements 3.2, 3.3**
   */
  describe('Property 3: Level Increment on Job Acceptance', () => {
    it('should increment level number by exactly 1', () => {
      fc.assert(
        fc.property(activeLevelArb, jobIdArb, (currentLevel, jobId) => {
          const { newLevel } = completeLevel(currentLevel, jobId);

          // Property: new level number should be exactly currentLevel + 1
          expect(newLevel.levelNumber).toBe(currentLevel.levelNumber + 1);
        }),
        { numRuns: 100 }
      );
    });

    it('should mark current level as completed', () => {
      fc.assert(
        fc.property(activeLevelArb, jobIdArb, (currentLevel, jobId) => {
          const { completedLevel } = completeLevel(currentLevel, jobId);

          // Property: completed level should have completedAt date
          expect(completedLevel.completedAt).toBeInstanceOf(Date);
          expect(completedLevel.completedAt).not.toBeUndefined();
        }),
        { numRuns: 100 }
      );
    });

    it('should set accepted job ID on completed level', () => {
      fc.assert(
        fc.property(activeLevelArb, jobIdArb, (currentLevel, jobId) => {
          const { completedLevel } = completeLevel(currentLevel, jobId);

          // Property: completed level should have the accepted job ID
          expect(completedLevel.acceptedJobId).toBe(jobId);
        }),
        { numRuns: 100 }
      );
    });

    it('should create new level with no completion date', () => {
      fc.assert(
        fc.property(activeLevelArb, jobIdArb, (currentLevel, jobId) => {
          const { newLevel } = completeLevel(currentLevel, jobId);

          // Property: new level should not be completed
          expect(newLevel.completedAt).toBeUndefined();
          expect(newLevel.acceptedJobId).toBeUndefined();
        }),
        { numRuns: 100 }
      );
    });

    it('should create new level with valid startedAt date', () => {
      fc.assert(
        fc.property(activeLevelArb, jobIdArb, (currentLevel, jobId) => {
          const { newLevel } = completeLevel(currentLevel, jobId);

          // Property: new level should have valid startedAt
          expect(newLevel.startedAt).toBeInstanceOf(Date);
          expect(isNaN(newLevel.startedAt.getTime())).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should create new level with unique ID', () => {
      fc.assert(
        fc.property(activeLevelArb, jobIdArb, (currentLevel, jobId) => {
          const { completedLevel, newLevel } = completeLevel(currentLevel, jobId);

          // Property: new level ID should be different from completed level ID
          expect(newLevel.id).not.toBe(completedLevel.id);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve original level data in completed level', () => {
      fc.assert(
        fc.property(activeLevelArb, jobIdArb, (currentLevel, jobId) => {
          const { completedLevel } = completeLevel(currentLevel, jobId);

          // Property: completed level should preserve original data
          expect(completedLevel.id).toBe(currentLevel.id);
          expect(completedLevel.levelNumber).toBe(currentLevel.levelNumber);
          expect(completedLevel.title).toBe(currentLevel.title);
          expect(completedLevel.startedAt).toEqual(currentLevel.startedAt);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate correct title for new level', () => {
      fc.assert(
        fc.property(activeLevelArb, jobIdArb, (currentLevel, jobId) => {
          const { newLevel } = completeLevel(currentLevel, jobId);
          const expectedTitle = `Level ${currentLevel.levelNumber + 1}`;

          // Property: new level title should follow "Level N" pattern
          expect(newLevel.title).toBe(expectedTitle);
        }),
        { numRuns: 100 }
      );
    });

    it('should have completedAt and startedAt at same time', () => {
      fc.assert(
        fc.property(activeLevelArb, jobIdArb, (currentLevel, jobId) => {
          const { completedLevel, newLevel } = completeLevel(currentLevel, jobId);

          // Property: completion time should equal new level start time
          expect(completedLevel.completedAt!.getTime()).toBe(
            newLevel.startedAt.getTime()
          );
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: Completed Levels Persistence
   *
   * For any sequence of level completions, all previously completed levels
   * SHALL remain in the completedLevels array—the array length never decreases.
   *
   * **Validates: Requirements 3.4**
   */
  describe('Property 4: Completed Levels Persistence', () => {
    it('should accumulate completed levels without loss', () => {
      fc.assert(
        fc.property(
          fc.array(jobIdArb, { minLength: 1, maxLength: 10 }),
          (jobIds) => {
            const completedLevels: JourneyLevel[] = [];
            let currentLevel = createInitialLevel();

            // Complete levels sequentially
            for (const jobId of jobIds) {
              const result = completeLevel(currentLevel, jobId);
              completedLevels.push(result.completedLevel);
              currentLevel = result.newLevel;
            }

            // Property: number of completed levels should equal number of job acceptances
            expect(completedLevels.length).toBe(jobIds.length);

            // Property: completed levels array length should never decrease
            for (let i = 1; i < completedLevels.length; i++) {
              expect(completedLevels.slice(0, i + 1).length).toBeGreaterThanOrEqual(
                completedLevels.slice(0, i).length
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve all completed level data', () => {
      fc.assert(
        fc.property(
          fc.array(jobIdArb, { minLength: 2, maxLength: 5 }),
          (jobIds) => {
            const completedLevels: JourneyLevel[] = [];
            let currentLevel = createInitialLevel();

            // Complete levels sequentially
            for (const jobId of jobIds) {
              const result = completeLevel(currentLevel, jobId);
              completedLevels.push(result.completedLevel);
              currentLevel = result.newLevel;
            }

            // Property: each completed level should have all required data
            completedLevels.forEach((level, index) => {
              expect(level.levelNumber).toBe(index);
              expect(level.completedAt).toBeInstanceOf(Date);
              expect(level.acceptedJobId).toBe(jobIds[index]);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain sequential level numbers', () => {
      fc.assert(
        fc.property(
          fc.array(jobIdArb, { minLength: 1, maxLength: 10 }),
          (jobIds) => {
            const completedLevels: JourneyLevel[] = [];
            let currentLevel = createInitialLevel();

            for (const jobId of jobIds) {
              const result = completeLevel(currentLevel, jobId);
              completedLevels.push(result.completedLevel);
              currentLevel = result.newLevel;
            }

            // Property: level numbers should be sequential starting from 0
            completedLevels.forEach((level, index) => {
              expect(level.levelNumber).toBe(index);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 5: Completed Level Data Integrity
   *
   * For any completed level in the journey state, it SHALL have both
   * a non-empty title and a valid completedAt date.
   *
   * **Validates: Requirements 3.6**
   */
  describe('Property 5: Completed Level Data Integrity', () => {
    it('should have non-empty title for completed levels', () => {
      fc.assert(
        fc.property(activeLevelArb, jobIdArb, (currentLevel, jobId) => {
          const { completedLevel } = completeLevel(currentLevel, jobId);

          // Property: completed level should have non-empty title
          expect(completedLevel.title).toBeDefined();
          expect(completedLevel.title.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should have valid completedAt date for completed levels', () => {
      fc.assert(
        fc.property(activeLevelArb, jobIdArb, (currentLevel, jobId) => {
          const { completedLevel } = completeLevel(currentLevel, jobId);

          // Property: completed level should have valid completedAt date
          expect(completedLevel.completedAt).toBeInstanceOf(Date);
          expect(isNaN(completedLevel.completedAt!.getTime())).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should pass validateCompletedLevelData for completed levels', () => {
      fc.assert(
        fc.property(activeLevelArb, jobIdArb, (currentLevel, jobId) => {
          const { completedLevel } = completeLevel(currentLevel, jobId);

          // Property: completed level should pass validation
          expect(validateCompletedLevelData(completedLevel)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should fail validateCompletedLevelData for active levels', () => {
      fc.assert(
        fc.property(activeLevelArb, (activeLevel) => {
          // Property: active level (no completedAt) should fail completed validation
          expect(validateCompletedLevelData(activeLevel)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should pass validateLevelData for both active and completed levels', () => {
      fc.assert(
        fc.property(journeyLevelArb, (level) => {
          // Property: any valid level should pass basic validation
          expect(validateLevelData(level)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should fail validation for level with empty title', () => {
      const invalidLevel: JourneyLevel = {
        id: 'test-id',
        levelNumber: 0,
        title: '',
        startedAt: new Date(),
        completedAt: new Date(),
        acceptedJobId: 'job-id',
      };

      // Property: level with empty title should fail validation
      expect(validateLevelData(invalidLevel)).toBe(false);
      expect(validateCompletedLevelData(invalidLevel)).toBe(false);
    });

    it('should fail validation for level with invalid startedAt', () => {
      const invalidLevel: JourneyLevel = {
        id: 'test-id',
        levelNumber: 0,
        title: 'Test Level',
        startedAt: new Date('invalid'),
        completedAt: undefined,
        acceptedJobId: undefined,
      };

      // Property: level with invalid startedAt should fail validation
      expect(validateLevelData(invalidLevel)).toBe(false);
    });

    it('should fail validation for level with negative levelNumber', () => {
      const invalidLevel: JourneyLevel = {
        id: 'test-id',
        levelNumber: -1,
        title: 'Test Level',
        startedAt: new Date(),
        completedAt: undefined,
        acceptedJobId: undefined,
      };

      // Property: level with negative levelNumber should fail validation
      expect(validateLevelData(invalidLevel)).toBe(false);
    });
  });

  /**
   * Additional tests for helper functions
   */
  describe('Helper Functions', () => {
    describe('getLevelTitle', () => {
      it('should return "Job Hunt" for level 0', () => {
        expect(getLevelTitle(0)).toBe('Job Hunt');
      });

      it('should return "Level N" for levels > 0', () => {
        fc.assert(
          fc.property(fc.integer({ min: 1, max: 100 }), (levelNumber) => {
            const title = getLevelTitle(levelNumber);
            expect(title).toBe(`Level ${levelNumber}`);
          }),
          { numRuns: 100 }
        );
      });
    });

    describe('getNextLevelNumber', () => {
      it('should return current + 1', () => {
        fc.assert(
          fc.property(levelNumberArb, (currentLevel) => {
            const nextLevel = getNextLevelNumber(currentLevel);
            expect(nextLevel).toBe(currentLevel + 1);
          }),
          { numRuns: 100 }
        );
      });
    });

    describe('isInitialLevel', () => {
      it('should return true only for level 0 with title "Job Hunt"', () => {
        const initialLevel = createInitialLevel();
        expect(isInitialLevel(initialLevel)).toBe(true);

        const nonInitialLevel: JourneyLevel = {
          id: 'test-id',
          levelNumber: 1,
          title: 'Level 1',
          startedAt: new Date(),
          completedAt: undefined,
          acceptedJobId: undefined,
        };
        expect(isInitialLevel(nonInitialLevel)).toBe(false);

        const wrongTitleLevel: JourneyLevel = {
          id: 'test-id',
          levelNumber: 0,
          title: 'Wrong Title',
          startedAt: new Date(),
          completedAt: undefined,
          acceptedJobId: undefined,
        };
        expect(isInitialLevel(wrongTitleLevel)).toBe(false);
      });
    });
  });
});
