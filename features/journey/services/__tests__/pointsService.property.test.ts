/**
 * Property-Based Tests for Points Service
 *
 * Feature: career-journey
 *
 * These tests verify the points service's action validation and point
 * award correctness using property-based testing with fast-check.
 */

import * as fc from 'fast-check';
import { PointActionType } from '../../../../types/journey';
import {
  isValidPointAction,
  getPointValue,
  VALID_POINT_ACTIONS,
} from '../pointsService';
import { POINT_VALUES } from '../../../../store/journeyStore';

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

/**
 * Generator for valid PointActionType values
 */
const validPointActionArb: fc.Arbitrary<PointActionType> = fc.constantFrom(
  'job_added',
  'task_completed',
  'habit_completed'
);

/**
 * Generator for invalid action type strings
 * These are strings that should NOT be valid point actions
 */
const invalidActionTypeArb: fc.Arbitrary<string> = fc.string().filter(
  (s) => !VALID_POINT_ACTIONS.includes(s as PointActionType)
);

/**
 * Generator for any string (to test validation)
 */
const anyStringArb = fc.string({ minLength: 0, maxLength: 100 });

// ============================================================================
// Property Tests
// ============================================================================

describe('Points Service Property Tests', () => {
  /**
   * Property 10: Point Award Action Validation
   *
   * For any point award request, points SHALL only be awarded if the action
   * type is one of: 'job_added', 'task_completed', or 'habit_completed'.
   *
   * **Validates: Requirements 6.1**
   */
  describe('Property 10: Point Award Action Validation', () => {
    it('should return true for all valid action types', () => {
      fc.assert(
        fc.property(validPointActionArb, (actionType) => {
          // Property: all valid action types should pass validation
          expect(isValidPointAction(actionType)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should return false for invalid action types', () => {
      fc.assert(
        fc.property(invalidActionTypeArb, (actionType) => {
          // Property: invalid action types should fail validation
          expect(isValidPointAction(actionType)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should only accept exactly the three valid action types', () => {
      // Property: VALID_POINT_ACTIONS should contain exactly 3 items
      expect(VALID_POINT_ACTIONS.length).toBe(3);
      expect(VALID_POINT_ACTIONS).toContain('job_added');
      expect(VALID_POINT_ACTIONS).toContain('task_completed');
      expect(VALID_POINT_ACTIONS).toContain('habit_completed');
    });

    it('should return positive point value for valid actions', () => {
      fc.assert(
        fc.property(validPointActionArb, (actionType) => {
          const points = getPointValue(actionType);

          // Property: valid actions should have positive point values
          expect(points).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should return correct point values for each action type', () => {
      // Property: each action type should have its defined point value
      expect(getPointValue('job_added')).toBe(10);
      expect(getPointValue('task_completed')).toBe(5);
      expect(getPointValue('habit_completed')).toBe(5);
    });

    it('should have consistent point values with POINT_VALUES constant', () => {
      fc.assert(
        fc.property(validPointActionArb, (actionType) => {
          const serviceValue = getPointValue(actionType);
          const constantValue = POINT_VALUES[actionType];

          // Property: service should return same values as POINT_VALUES constant
          expect(serviceValue).toBe(constantValue);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject empty string as action type', () => {
      expect(isValidPointAction('')).toBe(false);
    });

    it('should reject action types with different casing', () => {
      fc.assert(
        fc.property(validPointActionArb, (actionType) => {
          const upperCase = actionType.toUpperCase();
          const mixedCase = actionType
            .split('')
            .map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()))
            .join('');

          // Property: validation should be case-sensitive
          if (upperCase !== actionType) {
            expect(isValidPointAction(upperCase)).toBe(false);
          }
          if (mixedCase !== actionType) {
            expect(isValidPointAction(mixedCase)).toBe(false);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should reject action types with whitespace', () => {
      fc.assert(
        fc.property(validPointActionArb, (actionType) => {
          const withLeadingSpace = ' ' + actionType;
          const withTrailingSpace = actionType + ' ';
          const withBothSpaces = ' ' + actionType + ' ';

          // Property: action types with whitespace should be rejected
          expect(isValidPointAction(withLeadingSpace)).toBe(false);
          expect(isValidPointAction(withTrailingSpace)).toBe(false);
          expect(isValidPointAction(withBothSpaces)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject similar but incorrect action types', () => {
      const similarInvalidTypes = [
        'job_add',
        'jobs_added',
        'job-added',
        'jobAdded',
        'task_complete',
        'tasks_completed',
        'task-completed',
        'taskCompleted',
        'habit_complete',
        'habits_completed',
        'habit-completed',
        'habitCompleted',
        'job_removed',
        'task_created',
        'habit_started',
      ];

      similarInvalidTypes.forEach((invalidType) => {
        expect(isValidPointAction(invalidType)).toBe(false);
      });
    });

    it('should handle null and undefined gracefully', () => {
      // These should return false without throwing
      expect(isValidPointAction(null as unknown as string)).toBe(false);
      expect(isValidPointAction(undefined as unknown as string)).toBe(false);
    });

    it('should handle non-string types gracefully', () => {
      // These should return false without throwing
      expect(isValidPointAction(123 as unknown as string)).toBe(false);
      expect(isValidPointAction({} as unknown as string)).toBe(false);
      expect(isValidPointAction([] as unknown as string)).toBe(false);
    });

    it('should validate that all POINT_VALUES keys are valid actions', () => {
      const pointValueKeys = Object.keys(POINT_VALUES);

      pointValueKeys.forEach((key) => {
        // Property: all keys in POINT_VALUES should be valid action types
        expect(isValidPointAction(key)).toBe(true);
      });
    });

    it('should validate that all valid actions have defined point values', () => {
      VALID_POINT_ACTIONS.forEach((actionType) => {
        const points = getPointValue(actionType);

        // Property: all valid actions should have defined, positive point values
        expect(points).toBeDefined();
        expect(points).toBeGreaterThan(0);
        expect(Number.isInteger(points)).toBe(true);
      });
    });
  });
});
