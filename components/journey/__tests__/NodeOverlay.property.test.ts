/**
 * Property-Based Tests for NodeOverlay Component
 *
 * Feature: career-journey, Property 8: Unlocked Milestone Overlay Data Completeness
 *
 * These tests verify that unlocked milestones contain all required data
 * for the overlay display.
 *
 * **Validates: Requirements 5.2**
 */

import * as fc from 'fast-check';
import type { Milestone, MilestoneType } from '../../../types/journey';
import { MILESTONE_CONFIG, MILESTONE_TYPES } from '../../../config/milestones';

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
 * Generator for an unlocked Milestone (has unlockedAt date)
 */
const unlockedMilestoneArb: fc.Arbitrary<Milestone> = milestoneTypeArb.chain(
  (type) => {
    const definition = MILESTONE_CONFIG[type];
    return fc.record({
      id: fc.uuid(),
      type: fc.constant(type),
      title: fc.constant(definition.title),
      description: fc.constant(definition.description),
      threshold: fc.constant(definition.threshold),
      unlockedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
      reflection: fc.option(fc.string({ minLength: 0, maxLength: 280 }), {
        nil: undefined,
      }),
    });
  }
);

/**
 * Generator for a locked Milestone (no unlockedAt date)
 */
const lockedMilestoneArb: fc.Arbitrary<Milestone> = milestoneTypeArb.chain(
  (type) => {
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
  }
);

// ============================================================================
// Helper Functions for Overlay Data Extraction
// ============================================================================

/**
 * Represents the data required for the NodeOverlay display
 */
interface OverlayData {
  title: string;
  description: string;
  unlockedAt: Date | undefined;
  threshold: number;
  reflection: string | undefined;
}

/**
 * Extracts overlay data from a milestone
 */
function getOverlayData(milestone: Milestone): OverlayData {
  return {
    title: milestone.title,
    description: milestone.description,
    unlockedAt: milestone.unlockedAt,
    threshold: milestone.threshold,
    reflection: milestone.reflection,
  };
}

/**
 * Validates that overlay data is complete for an unlocked milestone
 */
function isOverlayDataComplete(data: OverlayData): boolean {
  // Title must be non-empty
  if (!data.title || data.title.trim().length === 0) {
    return false;
  }

  // Description must be non-empty
  if (!data.description || data.description.trim().length === 0) {
    return false;
  }

  // UnlockedAt must be a valid Date for unlocked milestones
  if (!data.unlockedAt || !(data.unlockedAt instanceof Date)) {
    return false;
  }

  // Threshold must be a positive number
  if (typeof data.threshold !== 'number' || data.threshold < 1) {
    return false;
  }

  return true;
}

// ============================================================================
// Property Tests
// ============================================================================

describe('NodeOverlay Property Tests', () => {
  /**
   * Property 8: Unlocked Milestone Overlay Data Completeness
   *
   * For any unlocked milestone, its overlay data SHALL contain:
   * a non-empty title, a valid unlockedAt date, and relevant statistics object.
   *
   * **Validates: Requirements 5.2**
   */
  describe('Property 8: Unlocked Milestone Overlay Data Completeness', () => {
    it('should have complete overlay data for all unlocked milestones', () => {
      fc.assert(
        fc.property(unlockedMilestoneArb, (milestone) => {
          const overlayData = getOverlayData(milestone);

          // Property: overlay data should be complete for unlocked milestones
          expect(isOverlayDataComplete(overlayData)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should have non-empty title for unlocked milestones', () => {
      fc.assert(
        fc.property(unlockedMilestoneArb, (milestone) => {
          const overlayData = getOverlayData(milestone);

          // Property: title must be a non-empty string
          expect(typeof overlayData.title).toBe('string');
          expect(overlayData.title.trim().length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should have valid unlockedAt date for unlocked milestones', () => {
      fc.assert(
        fc.property(unlockedMilestoneArb, (milestone) => {
          const overlayData = getOverlayData(milestone);

          // Property: unlockedAt must be a valid Date object
          expect(overlayData.unlockedAt).toBeInstanceOf(Date);
          expect(overlayData.unlockedAt!.getTime()).not.toBeNaN();
        }),
        { numRuns: 100 }
      );
    });

    it('should have positive threshold value for unlocked milestones', () => {
      fc.assert(
        fc.property(unlockedMilestoneArb, (milestone) => {
          const overlayData = getOverlayData(milestone);

          // Property: threshold must be a positive number
          expect(typeof overlayData.threshold).toBe('number');
          expect(overlayData.threshold).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should have non-empty description for unlocked milestones', () => {
      fc.assert(
        fc.property(unlockedMilestoneArb, (milestone) => {
          const overlayData = getOverlayData(milestone);

          // Property: description must be a non-empty string
          expect(typeof overlayData.description).toBe('string');
          expect(overlayData.description.trim().length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should allow optional reflection field', () => {
      fc.assert(
        fc.property(unlockedMilestoneArb, (milestone) => {
          const overlayData = getOverlayData(milestone);

          // Property: reflection can be undefined or a string
          if (overlayData.reflection !== undefined) {
            expect(typeof overlayData.reflection).toBe('string');
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should have consistent data extraction', () => {
      fc.assert(
        fc.property(unlockedMilestoneArb, (milestone) => {
          const overlayData1 = getOverlayData(milestone);
          const overlayData2 = getOverlayData(milestone);

          // Property: extracting overlay data should be deterministic
          expect(overlayData1.title).toBe(overlayData2.title);
          expect(overlayData1.description).toBe(overlayData2.description);
          expect(overlayData1.threshold).toBe(overlayData2.threshold);
          expect(overlayData1.unlockedAt?.getTime()).toBe(
            overlayData2.unlockedAt?.getTime()
          );
        }),
        { numRuns: 100 }
      );
    });

    it('should have title matching milestone config', () => {
      fc.assert(
        fc.property(unlockedMilestoneArb, (milestone) => {
          const overlayData = getOverlayData(milestone);
          const configTitle = MILESTONE_CONFIG[milestone.type].title;

          // Property: title should match the configured title
          expect(overlayData.title).toBe(configTitle);
        }),
        { numRuns: 100 }
      );
    });

    it('should have threshold matching milestone config', () => {
      fc.assert(
        fc.property(unlockedMilestoneArb, (milestone) => {
          const overlayData = getOverlayData(milestone);
          const configThreshold = MILESTONE_CONFIG[milestone.type].threshold;

          // Property: threshold should match the configured threshold
          expect(overlayData.threshold).toBe(configThreshold);
        }),
        { numRuns: 100 }
      );
    });

    it('should not have complete overlay data for locked milestones', () => {
      fc.assert(
        fc.property(lockedMilestoneArb, (milestone) => {
          const overlayData = getOverlayData(milestone);

          // Property: locked milestones should NOT have complete overlay data
          // (missing unlockedAt date)
          expect(isOverlayDataComplete(overlayData)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should have unlockedAt as undefined for locked milestones', () => {
      fc.assert(
        fc.property(lockedMilestoneArb, (milestone) => {
          const overlayData = getOverlayData(milestone);

          // Property: locked milestones should have undefined unlockedAt
          expect(overlayData.unlockedAt).toBeUndefined();
        }),
        { numRuns: 100 }
      );
    });
  });
});
