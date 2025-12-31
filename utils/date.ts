// Date utility functions for JobAppTracker Mobile

/**
 * Formats a Date object to a localized date string
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Formats a date relative to the current time (e.g., "2 days ago", "in 3 hours")
 * Uses a simple implementation that works across all React Native environments
 * @param date - The date to format
 * @returns Relative time string
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  // Handle future dates
  if (diffMs < 0) {
    const absDiffDays = Math.abs(diffDays);
    const absDiffHours = Math.abs(diffHours);
    const absDiffMinutes = Math.abs(diffMinutes);
    
    if (absDiffDays >= 1) {
      return absDiffDays === 1 ? 'in 1 day' : `in ${absDiffDays} days`;
    } else if (absDiffHours >= 1) {
      return absDiffHours === 1 ? 'in 1 hour' : `in ${absDiffHours} hours`;
    } else if (absDiffMinutes >= 1) {
      return absDiffMinutes === 1 ? 'in 1 minute' : `in ${absDiffMinutes} minutes`;
    } else {
      return 'just now';
    }
  }

  // Handle past dates
  if (diffDays >= 1) {
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    }
    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  } else if (diffHours >= 1) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffMinutes >= 1) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  } else {
    return 'just now';
  }
}

/**
 * Checks if a date is today
 * @param date - The date to check
 * @returns True if the date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Parses an ISO date string into a Date object
 * @param isoString - ISO 8601 date string
 * @returns Date object or null if invalid
 */
export function parseISODate(isoString: string | null | undefined): Date | null {
  if (!isoString) {
    return null;
  }
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Serializes a Date object to ISO string for API requests
 * @param date - The date to serialize
 * @returns ISO string or undefined if date is null/undefined
 */
export function serializeDate(date: Date | null | undefined): string | undefined {
  if (!date) {
    return undefined;
  }
  return date.toISOString();
}

/**
 * Gets the start of the day for a given date
 * @param date - The date
 * @returns Date object set to start of day (00:00:00.000)
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Gets the end of the day for a given date
 * @param date - The date
 * @returns Date object set to end of day (23:59:59.999)
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
