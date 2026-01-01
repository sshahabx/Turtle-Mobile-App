/**
 * Notification Services
 * 
 * Exports all notification-related services.
 */

// Re-export everything explicitly to avoid Metro bundler issues
export {
  initializeNotificationService,
  cleanupNotificationService,
  setupNotificationListeners,
  createJobStatusNotification,
  createHabitReminderNotification,
  createTaskDueNotification,
  createTaskOverdueNotification,
  createGoalAchievementNotification,
  createDailySummaryNotification,
  isTaskDueWithinHours,
  isTaskOverdue,
  isGoalAchieved,
  isTypeEnabled,
  calculateTaskReminderTime,
  calculateHabitReminderTime,
  scheduleHabitReminder,
  scheduleHabitReminders,
  scheduleTaskReminder,
  scheduleTaskReminders,
  cancelScheduledNotification,
  cancelScheduledNotificationForItem,
  rescheduleHabitReminder,
  rescheduleAllHabitReminders,
  isNotificationScheduled,
  getScheduledNotification,
  getAllScheduledNotifications,
  clearAllScheduledNotifications,
  requestPermissions,
  registerForPushNotifications,
  handleNotificationReceived,
  handleNotificationResponse,
  getPushPermissionStatus,
  getExpoPushToken,
  isPushEnabled,
  resetPushState,
  // Error handling utilities
  setToastCallback,
  clearToastCallback,
  notificationService,
} from './notificationService';

export type {
  DailySummaryStats,
  ScheduledNotificationInfo,
  PushPermissionStatus,
} from './notificationService';

export { default } from './notificationService';
