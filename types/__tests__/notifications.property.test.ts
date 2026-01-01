/**
 * Property-Based Tests for Notification Types
 * 
 * Feature: notification-service
 * 
 * These tests verify the notification type validators and structure invariants
 * using property-based testing with fast-check.
 */

import * as fc from 'fast-check';
import {
  NotificationType,
  Notification,
  NotificationPreferences,
  NotificationCreateInput,
  isValidNotificationType,
  isValidNotification,
  isValidNotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '../notifications';

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

/**
 * Generator for valid NotificationType values
 */
const notificationTypeArb = fc.constantFrom(
  NotificationType.JOB_STATUS_CHANGE,
  NotificationType.HABIT_REMINDER,
  NotificationType.TASK_DUE,
  NotificationType.TASK_OVERDUE,
  NotificationType.GOAL_ACHIEVEMENT,
  NotificationType.DAILY_SUMMARY
);

/**
 * Generator for non-empty strings (for titles)
 */
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 100 });

/**
 * Generator for valid notification data
 */
const notificationDataArb = fc.option(
  fc.record({
    targetType: fc.option(fc.constantFrom('job', 'habit', 'task', 'note') as fc.Arbitrary<'job' | 'habit' | 'task' | 'note'>),
    targetId: fc.option(fc.uuid()),
  }),
  { nil: undefined }
);

/**
 * Generator for valid Notification objects
 */
const validNotificationArb: fc.Arbitrary<Notification> = fc.record({
  id: fc.uuid(),
  type: notificationTypeArb,
  title: nonEmptyStringArb,
  body: fc.string(),
  timestamp: fc.date(),
  read: fc.boolean(),
  data: notificationDataArb,
});

/**
 * Generator for valid time strings in HH:mm format
 */
const timeStringArb = fc.tuple(
  fc.integer({ min: 0, max: 23 }),
  fc.integer({ min: 0, max: 59 })
).map(([h, m]) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);

/**
 * Generator for valid NotificationPreferences objects
 */
const validPreferencesArb: fc.Arbitrary<NotificationPreferences> = fc.record({
  enabled: fc.boolean(),
  jobStatusChanges: fc.boolean(),
  habitReminders: fc.boolean(),
  taskDueReminders: fc.boolean(),
  goalAchievements: fc.boolean(),
  dailySummary: fc.boolean(),
  habitReminderTime: timeStringArb,
});

// ============================================================================
// Property Tests
// ============================================================================

describe('Notification Types Property Tests', () => {
  /**
   * Property 8: Notification Structure Invariant
   * 
   * For any notification in the store, it SHALL contain all required fields:
   * id (non-empty string), type (valid NotificationType), title (non-empty string),
   * body (string), timestamp (valid Date), and read (boolean).
   * 
   * **Validates: Requirements 4.7, 5.3**
   */
  describe('Property 8: Notification Structure Invariant', () => {
    it('should validate that all generated notifications have required fields', () => {
      fc.assert(
        fc.property(validNotificationArb, (notification) => {
          // Property: every valid notification must pass validation
          expect(isValidNotification(notification)).toBe(true);
          
          // Property: id must be non-empty string
          expect(typeof notification.id).toBe('string');
          expect(notification.id.length).toBeGreaterThan(0);
          
          // Property: type must be valid NotificationType
          expect(isValidNotificationType(notification.type)).toBe(true);
          
          // Property: title must be non-empty string
          expect(typeof notification.title).toBe('string');
          expect(notification.title.length).toBeGreaterThan(0);
          
          // Property: body must be string
          expect(typeof notification.body).toBe('string');
          
          // Property: timestamp must be Date
          expect(notification.timestamp instanceof Date).toBe(true);
          
          // Property: read must be boolean
          expect(typeof notification.read).toBe('boolean');
        }),
        { numRuns: 100 }
      );
    });

    it('should reject notifications with missing or invalid id', () => {
      fc.assert(
        fc.property(validNotificationArb, (notification) => {
          // Test with empty id
          const withEmptyId = { ...notification, id: '' };
          expect(isValidNotification(withEmptyId)).toBe(false);
          
          // Test with non-string id
          const withNumberId = { ...notification, id: 123 };
          expect(isValidNotification(withNumberId)).toBe(false);
          
          // Test with missing id
          const { id, ...withoutId } = notification;
          expect(isValidNotification(withoutId)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject notifications with invalid type', () => {
      fc.assert(
        fc.property(validNotificationArb, fc.string(), (notification, invalidType) => {
          // Skip if randomly generated string happens to be a valid type
          if (Object.values(NotificationType).includes(invalidType as NotificationType)) {
            return;
          }
          
          const withInvalidType = { ...notification, type: invalidType };
          expect(isValidNotification(withInvalidType)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject notifications with empty title', () => {
      fc.assert(
        fc.property(validNotificationArb, (notification) => {
          const withEmptyTitle = { ...notification, title: '' };
          expect(isValidNotification(withEmptyTitle)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject notifications with invalid read status', () => {
      fc.assert(
        fc.property(validNotificationArb, (notification) => {
          const withStringRead = { ...notification, read: 'true' };
          expect(isValidNotification(withStringRead)).toBe(false);
          
          const withNumberRead = { ...notification, read: 1 };
          expect(isValidNotification(withNumberRead)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should accept notifications with valid timestamp as Date or string', () => {
      fc.assert(
        fc.property(validNotificationArb, (notification) => {
          // Date object should be valid
          expect(isValidNotification(notification)).toBe(true);
          
          // ISO string should also be valid (for deserialization)
          const withStringTimestamp = { 
            ...notification, 
            timestamp: notification.timestamp.toISOString() 
          };
          expect(isValidNotification(withStringTimestamp)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('NotificationType Validation', () => {
    it('should accept all valid notification types', () => {
      fc.assert(
        fc.property(notificationTypeArb, (type) => {
          expect(isValidNotificationType(type)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject invalid notification types', () => {
      fc.assert(
        fc.property(fc.string(), (randomString) => {
          // Skip if randomly generated string happens to be a valid type
          if (Object.values(NotificationType).includes(randomString as NotificationType)) {
            return;
          }
          expect(isValidNotificationType(randomString)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('NotificationPreferences Validation', () => {
    it('should validate all generated preferences', () => {
      fc.assert(
        fc.property(validPreferencesArb, (prefs) => {
          expect(isValidNotificationPreferences(prefs)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should validate default preferences', () => {
      expect(isValidNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES)).toBe(true);
    });

    it('should reject preferences with invalid time format', () => {
      fc.assert(
        fc.property(validPreferencesArb, fc.string(), (prefs, invalidTime) => {
          // Skip if randomly generated string happens to match HH:mm format
          if (/^\d{2}:\d{2}$/.test(invalidTime)) {
            return;
          }
          
          const withInvalidTime = { ...prefs, habitReminderTime: invalidTime };
          expect(isValidNotificationPreferences(withInvalidTime)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject preferences with missing boolean fields', () => {
      fc.assert(
        fc.property(validPreferencesArb, (prefs) => {
          const { enabled, ...withoutEnabled } = prefs;
          expect(isValidNotificationPreferences(withoutEnabled)).toBe(false);
          
          const { jobStatusChanges, ...withoutJobStatus } = prefs;
          expect(isValidNotificationPreferences(withoutJobStatus)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });
});
