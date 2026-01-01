/**
 * Notification Types and Interfaces
 * 
 * This file defines all types related to the notification service including
 * notification categories, notification entities, preferences, and input types.
 */

// ============================================================================
// Notification Type Enum
// ============================================================================

/**
 * Categories of notifications supported by the notification service.
 * Each type corresponds to a specific event in the application.
 */
export enum NotificationType {
  /** Notification when a job application status changes */
  JOB_STATUS_CHANGE = 'job_status_change',
  /** Daily reminder for incomplete habits */
  HABIT_REMINDER = 'habit_reminder',
  /** Reminder for tasks due within 24 hours */
  TASK_DUE = 'task_due',
  /** Notification for overdue tasks */
  TASK_OVERDUE = 'task_overdue',
  /** Celebration when daily job application goal is reached */
  GOAL_ACHIEVEMENT = 'goal_achievement',
  /** End-of-day summary of activity */
  DAILY_SUMMARY = 'daily_summary',
}

// ============================================================================
// Notification Entity
// ============================================================================

/**
 * Optional data attached to a notification for navigation and context.
 */
export interface NotificationData {
  /** Type of entity this notification relates to */
  targetType?: 'job' | 'habit' | 'task' | 'note';
  /** ID of the related entity for navigation */
  targetId?: string;
  /** Additional context-specific data */
  [key: string]: unknown;
}

/**
 * A notification entity stored in the notification store.
 * Contains all required fields for display and tracking.
 */
export interface Notification {
  /** Unique identifier (UUID) */
  id: string;
  /** Category of notification */
  type: NotificationType;
  /** Notification title displayed to user */
  title: string;
  /** Notification body text */
  body: string;
  /** When the notification was created */
  timestamp: Date;
  /** Whether the user has seen/read this notification */
  read: boolean;
  /** Optional navigation and context data */
  data?: NotificationData;
}

// ============================================================================
// Notification Preferences
// ============================================================================

/**
 * User-configurable settings that control which types of notifications
 * are enabled or disabled.
 */
export interface NotificationPreferences {
  /** Master toggle - when false, no notifications are delivered */
  enabled: boolean;
  /** Enable notifications for job status changes */
  jobStatusChanges: boolean;
  /** Enable daily reminders for incomplete habits */
  habitReminders: boolean;
  /** Enable reminders for upcoming/overdue tasks */
  taskDueReminders: boolean;
  /** Enable celebration notifications when daily goal is reached */
  goalAchievements: boolean;
  /** Enable end-of-day activity summary */
  dailySummary: boolean;
  /** Time for habit reminders in HH:mm format (default: "09:00") */
  habitReminderTime: string;
}

/**
 * Default notification preferences for new users.
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  jobStatusChanges: true,
  habitReminders: true,
  taskDueReminders: true,
  goalAchievements: true,
  dailySummary: false,
  habitReminderTime: '09:00',
};

// ============================================================================
// Notification Input Types
// ============================================================================

/**
 * Input type for creating a new notification.
 * The id, timestamp, and read status are generated automatically.
 */
export interface NotificationCreateInput {
  /** Category of notification */
  type: NotificationType;
  /** Notification title displayed to user */
  title: string;
  /** Notification body text */
  body: string;
  /** Optional navigation and context data */
  data?: NotificationData;
}

// ============================================================================
// Type Guards and Validators
// ============================================================================

/**
 * Checks if a value is a valid NotificationType.
 */
export function isValidNotificationType(value: unknown): value is NotificationType {
  return Object.values(NotificationType).includes(value as NotificationType);
}

/**
 * Checks if a notification has all required fields with valid types.
 */
export function isValidNotification(notification: unknown): notification is Notification {
  if (!notification || typeof notification !== 'object') {
    return false;
  }

  const n = notification as Record<string, unknown>;

  return (
    typeof n.id === 'string' &&
    n.id.length > 0 &&
    isValidNotificationType(n.type) &&
    typeof n.title === 'string' &&
    n.title.length > 0 &&
    typeof n.body === 'string' &&
    (n.timestamp instanceof Date || typeof n.timestamp === 'string') &&
    typeof n.read === 'boolean'
  );
}

/**
 * Checks if notification preferences have all required fields.
 */
export function isValidNotificationPreferences(prefs: unknown): prefs is NotificationPreferences {
  if (!prefs || typeof prefs !== 'object') {
    return false;
  }

  const p = prefs as Record<string, unknown>;

  return (
    typeof p.enabled === 'boolean' &&
    typeof p.jobStatusChanges === 'boolean' &&
    typeof p.habitReminders === 'boolean' &&
    typeof p.taskDueReminders === 'boolean' &&
    typeof p.goalAchievements === 'boolean' &&
    typeof p.dailySummary === 'boolean' &&
    typeof p.habitReminderTime === 'string' &&
    /^\d{2}:\d{2}$/.test(p.habitReminderTime)
  );
}
