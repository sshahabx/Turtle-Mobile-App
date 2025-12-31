/**
 * Utility functions for Free Tier Limits
 * 
 * These pure functions handle limit-related calculations and formatting
 * for the freemium model implementation.
 */

/**
 * Color scheme types for limit banner display
 * - neutral: usage below 70%
 * - warning: usage between 70-99%
 * - alert: usage at 100% (limit reached)
 */
export type ColorScheme = 'neutral' | 'warning' | 'alert';

/**
 * Calculates the usage percentage based on current count and maximum limit.
 * 
 * @param current - Current number of items
 * @param max - Maximum allowed items
 * @returns Usage percentage (0-100), clamped
 * 
 * @example
 * calculateUsagePercentage(3, 10) // returns 30
 * calculateUsagePercentage(10, 10) // returns 100
 * calculateUsagePercentage(15, 10) // returns 100 (clamped)
 */
export function calculateUsagePercentage(current: number, max: number): number {
  if (max <= 0) {
    return 0;
  }
  const percentage = Math.round((current / max) * 100);
  return Math.max(0, Math.min(100, percentage));
}

/**
 * Determines the color scheme based on usage percentage.
 * 
 * - Below 70%: neutral (gray)
 * - 70-99%: warning (amber)
 * - 100%: alert (red)
 * 
 * @param percentage - Usage percentage (0-100)
 * @returns Color scheme identifier
 * 
 * @example
 * getColorScheme(50) // returns 'neutral'
 * getColorScheme(75) // returns 'warning'
 * getColorScheme(100) // returns 'alert'
 */
export function getColorScheme(percentage: number): ColorScheme {
  if (percentage >= 100) {
    return 'alert';
  }
  if (percentage >= 70) {
    return 'warning';
  }
  return 'neutral';
}

/**
 * Formats the limit text for display in the UI.
 * 
 * @param current - Current number of items
 * @param max - Maximum allowed items
 * @param label - Entity label (e.g., "jobs", "notes")
 * @returns Formatted string for display
 * 
 * @example
 * formatLimitText(3, 10, 'jobs') // returns "3 of 10 jobs"
 * formatLimitText(10, 10, 'notes') // returns "10 of 10 notes"
 */
export function formatLimitText(current: number, max: number, label: string): string {
  return `${current} of ${max} ${label}`;
}
