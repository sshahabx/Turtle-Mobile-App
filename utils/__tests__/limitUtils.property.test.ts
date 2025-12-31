/**
 * Property-Based Tests for Limit Utility Functions
 * 
 * Feature: free-tier-limits
 * 
 * These tests verify the pure utility functions for limit calculations
 * using property-based testing with fast-check.
 */

import * as fc from 'fast-check';
import { calculateUsagePercentage, getColorScheme, ColorScheme } from '../limitUtils';

describe('limitUtils Property Tests', () => {
  /**
   * Property 3: Usage Percentage Calculation
   * 
   * For any current count and maximum limit where limit > 0,
   * the usage percentage SHALL equal Math.round((currentCount / maxLimit) * 100)
   * clamped between 0 and 100.
   * 
   * **Validates: Requirements 6.1, 7.2**
   */
  describe('Property 3: Usage Percentage Calculation', () => {
    it('should calculate percentage as Math.round((current / max) * 100) clamped to 0-100', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 1000 }),
          fc.integer({ min: 1, max: 1000 }),
          (current, max) => {
            const result = calculateUsagePercentage(current, max);
            const expected = Math.max(0, Math.min(100, Math.round((current / max) * 100)));
            
            // Property: result must equal expected clamped percentage
            expect(result).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always return a value between 0 and 100 inclusive', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: 10000 }),
          fc.integer({ min: 1, max: 1000 }),
          (current, max) => {
            const result = calculateUsagePercentage(current, max);
            
            // Property: result must be in range [0, 100]
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 when max is 0 or negative', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 1000 }),
          fc.integer({ min: -100, max: 0 }),
          (current, max) => {
            const result = calculateUsagePercentage(current, max);
            
            // Property: result must be 0 for invalid max
            expect(result).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 100 when current exceeds max', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.nat({ max: 100 }),
          (max, extra) => {
            const current = max + extra + 1; // Always exceeds max
            const result = calculateUsagePercentage(current, max);
            
            // Property: result must be clamped to 100
            expect(result).toBe(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: Color Scheme Selection
   * 
   * For any usage percentage:
   * - If percentage < 70, the color scheme SHALL be 'neutral'
   * - If percentage >= 70 AND percentage < 100, the color scheme SHALL be 'warning'
   * - If percentage >= 100, the color scheme SHALL be 'alert'
   * 
   * **Validates: Requirements 6.2, 6.3, 6.4**
   */
  describe('Property 4: Color Scheme Selection', () => {
    it('should return neutral for percentage < 70', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 69 }),
          (percentage) => {
            const result = getColorScheme(percentage);
            
            // Property: below 70% must be neutral
            expect(result).toBe('neutral');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return warning for percentage >= 70 and < 100', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 70, max: 99 }),
          (percentage) => {
            const result = getColorScheme(percentage);
            
            // Property: 70-99% must be warning
            expect(result).toBe('warning');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return alert for percentage >= 100', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 200 }),
          (percentage) => {
            const result = getColorScheme(percentage);
            
            // Property: 100%+ must be alert
            expect(result).toBe('alert');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always return a valid ColorScheme', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -50, max: 200 }),
          (percentage) => {
            const result = getColorScheme(percentage);
            const validSchemes: ColorScheme[] = ['neutral', 'warning', 'alert'];
            
            // Property: result must be a valid color scheme
            expect(validSchemes).toContain(result);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have mutually exclusive color scheme ranges', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 150 }),
          (percentage) => {
            const result = getColorScheme(percentage);
            
            // Property: exactly one condition should match
            const isNeutral = percentage < 70;
            const isWarning = percentage >= 70 && percentage < 100;
            const isAlert = percentage >= 100;
            
            if (isNeutral) expect(result).toBe('neutral');
            else if (isWarning) expect(result).toBe('warning');
            else if (isAlert) expect(result).toBe('alert');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
