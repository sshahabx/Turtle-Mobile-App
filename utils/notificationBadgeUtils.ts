/**
 * Notification Badge Utility Functions
 * 
 * Pure functions for notification badge display logic.
 * These are separated from the component for easier testing.
 * 
 * Requirements: 1.2, 1.3, 1.5
 */

/**
 * Format the badge display text based on count and maxCount
 * - Returns empty string for count <= 0
 * - Returns "99+" (or "{maxCount}+") for counts exceeding maxCount
 * - Returns the count as string otherwise
 * 
 * @param count - Number of unread notifications
 * @param maxCount - Maximum count to display before showing "+" suffix (default: 99)
 * @returns Formatted string for badge display
 */
export function formatBadgeCount(count: number, maxCount: number = 99): string {
  if (count <= 0) {
    return '';
  }
  if (count > maxCount) {
    return `${maxCount}+`;
  }
  return String(count);
}

/**
 * Determine if the badge should be visible
 * Badge is hidden when count is 0 or negative
 * 
 * @param count - Number of unread notifications
 * @returns Whether the badge should be displayed
 */
export function shouldShowBadge(count: number): boolean {
  return count > 0;
}
