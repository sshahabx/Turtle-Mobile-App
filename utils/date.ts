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
 * @param date - The date to format
 * @returns Relative time string
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, 'day');
  } else if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, 'hour');
  } else if (Math.abs(diffMinutes) >= 1) {
    return rtf.format(diffMinutes, 'minute');
  } else {
    return rtf.format(diffSeconds, 'second');
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
