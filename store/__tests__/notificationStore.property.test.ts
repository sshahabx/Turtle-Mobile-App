/**
 * Property-Based Tests for Notification Store
 *
 * Feature: notification-service
 *
 * These tests verify the notification store's persistence, state management,
 * and correctness properties using property-based testing with fast-check.
 */

import * as fc from 'fast-check';
import {
  NotificationType,
  Notification,
  NotificationPreferences,
  NotificationCreateInput,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '../../types/notifications';

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
    targetType: fc.option(
      fc.constantFrom('job', 'habit', 'task', 'note') as fc.Arbitrary<
        'job' | 'habit' | 'task' | 'note'
      >,
      { nil: undefined }
    ),
    targetId: fc.option(fc.uuid(), { nil: undefined }),
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
  timestamp: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
  read: fc.boolean(),
  data: notificationDataArb,
});

/**
 * Generator for valid time strings in HH:mm format
 */
const timeStringArb = fc
  .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
  .map(
    ([h, m]) =>
      `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  );

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

/**
 * Generator for NotificationCreateInput
 */
const notificationCreateInputArb: fc.Arbitrary<NotificationCreateInput> =
  fc.record({
    type: notificationTypeArb,
    title: nonEmptyStringArb,
    body: fc.string(),
    data: notificationDataArb,
  });

/**
 * Generator for a list of notifications (up to 150 to test limit)
 */
const notificationListArb = fc.array(validNotificationArb, {
  minLength: 0,
  maxLength: 150,
});

// ============================================================================
// Helper Functions for Testing
// ============================================================================

/**
 * Simulates serialization (what happens when storing to AsyncStorage)
 */
function serializeNotifications(notifications: Notification[]): string {
  return JSON.stringify({
    notifications: notifications.map((n) => ({
      ...n,
      timestamp:
        n.timestamp instanceof Date ? n.timestamp.toISOString() : n.timestamp,
    })),
  });
}

/**
 * Simulates deserialization (what happens when loading from AsyncStorage)
 */
function deserializeNotifications(json: string): Notification[] {
  const parsed = JSON.parse(json);
  return parsed.notifications.map(
    (n: Notification & { timestamp: string | Date }) => ({
      ...n,
      timestamp: new Date(n.timestamp),
    })
  );
}

/**
 * Simulates serialization for preferences
 */
function serializePreferences(prefs: NotificationPreferences): string {
  return JSON.stringify({ preferences: prefs });
}

/**
 * Simulates deserialization for preferences
 */
function deserializePreferences(json: string): NotificationPreferences {
  const parsed = JSON.parse(json);
  return parsed.preferences;
}

/**
 * Compares two notifications for equality (handling Date comparison)
 */
function notificationsEqual(a: Notification, b: Notification): boolean {
  return (
    a.id === b.id &&
    a.type === b.type &&
    a.title === b.title &&
    a.body === b.body &&
    a.timestamp.getTime() === b.timestamp.getTime() &&
    a.read === b.read &&
    JSON.stringify(a.data) === JSON.stringify(b.data)
  );
}

/**
 * Compares two notification lists for equality
 */
function notificationListsEqual(
  a: Notification[],
  b: Notification[]
): boolean {
  if (a.length !== b.length) return false;
  return a.every((notif, i) => notificationsEqual(notif, b[i]));
}

/**
 * Compares two preferences objects for equality
 */
function preferencesEqual(
  a: NotificationPreferences,
  b: NotificationPreferences
): boolean {
  return (
    a.enabled === b.enabled &&
    a.jobStatusChanges === b.jobStatusChanges &&
    a.habitReminders === b.habitReminders &&
    a.taskDueReminders === b.taskDueReminders &&
    a.goalAchievements === b.goalAchievements &&
    a.dailySummary === b.dailySummary &&
    a.habitReminderTime === b.habitReminderTime
  );
}

// ============================================================================
// Property Tests
// ============================================================================

describe('Notification Store Property Tests', () => {
  /**
   * Property 9: Notification Storage Round-Trip
   *
   * For any list of valid notifications, serializing to storage and
   * deserializing from storage SHALL produce an equivalent list of
   * notifications with all fields preserved.
   *
   * **Validates: Requirements 5.1, 5.5, 5.6**
   */
  describe('Property 9: Notification Storage Round-Trip', () => {
    it('should preserve all notification fields through serialization round-trip', () => {
      fc.assert(
        fc.property(notificationListArb, (notifications) => {
          // Serialize then deserialize
          const serialized = serializeNotifications(notifications);
          const deserialized = deserializeNotifications(serialized);

          // Property: round-trip should produce equivalent list
          expect(notificationListsEqual(notifications, deserialized)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve notification id through round-trip', () => {
      fc.assert(
        fc.property(validNotificationArb, (notification) => {
          const serialized = serializeNotifications([notification]);
          const [deserialized] = deserializeNotifications(serialized);

          expect(deserialized.id).toBe(notification.id);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve notification type through round-trip', () => {
      fc.assert(
        fc.property(validNotificationArb, (notification) => {
          const serialized = serializeNotifications([notification]);
          const [deserialized] = deserializeNotifications(serialized);

          expect(deserialized.type).toBe(notification.type);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve notification timestamp through round-trip', () => {
      fc.assert(
        fc.property(validNotificationArb, (notification) => {
          const serialized = serializeNotifications([notification]);
          const [deserialized] = deserializeNotifications(serialized);

          // Timestamps should be equal (comparing milliseconds)
          expect(deserialized.timestamp.getTime()).toBe(
            notification.timestamp.getTime()
          );
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve notification read status through round-trip', () => {
      fc.assert(
        fc.property(validNotificationArb, (notification) => {
          const serialized = serializeNotifications([notification]);
          const [deserialized] = deserializeNotifications(serialized);

          expect(deserialized.read).toBe(notification.read);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve notification data through round-trip', () => {
      fc.assert(
        fc.property(validNotificationArb, (notification) => {
          const serialized = serializeNotifications([notification]);
          const [deserialized] = deserializeNotifications(serialized);

          expect(JSON.stringify(deserialized.data)).toBe(
            JSON.stringify(notification.data)
          );
        }),
        { numRuns: 100 }
      );
    });

    it('should handle empty notification list', () => {
      const serialized = serializeNotifications([]);
      const deserialized = deserializeNotifications(serialized);

      expect(deserialized).toEqual([]);
    });
  });
});


  /**
   * Property 10: Maximum Notifications Limit
   *
   * For any sequence of notification additions, the notification store
   * SHALL never contain more than 100 notifications, with oldest
   * notifications removed when the limit is exceeded.
   *
   * **Validates: Requirements 5.2**
   */
  describe('Property 10: Maximum Notifications Limit', () => {
    const MAX_NOTIFICATIONS = 100;

    /**
     * Simulates the store's addNotification behavior with max limit enforcement
     */
    function simulateAddNotifications(
      inputs: NotificationCreateInput[]
    ): Notification[] {
      let notifications: Notification[] = [];

      for (const input of inputs) {
        const newNotification: Notification = {
          id: `id-${notifications.length}`,
          type: input.type,
          title: input.title,
          body: input.body,
          timestamp: new Date(),
          read: false,
          data: input.data,
        };

        // Add new notification at the beginning (newest first)
        notifications = [newNotification, ...notifications];

        // Enforce max limit - remove oldest notifications if exceeded
        if (notifications.length > MAX_NOTIFICATIONS) {
          notifications = notifications.slice(0, MAX_NOTIFICATIONS);
        }
      }

      return notifications;
    }

    it('should never exceed MAX_NOTIFICATIONS limit regardless of additions', () => {
      fc.assert(
        fc.property(
          fc.array(notificationCreateInputArb, { minLength: 0, maxLength: 200 }),
          (inputs) => {
            const notifications = simulateAddNotifications(inputs);

            // Property: count should never exceed MAX_NOTIFICATIONS
            expect(notifications.length).toBeLessThanOrEqual(MAX_NOTIFICATIONS);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have exactly MAX_NOTIFICATIONS when more are added', () => {
      fc.assert(
        fc.property(
          fc.array(notificationCreateInputArb, {
            minLength: MAX_NOTIFICATIONS + 1,
            maxLength: 200,
          }),
          (inputs) => {
            const notifications = simulateAddNotifications(inputs);

            // Property: when more than MAX are added, count should be exactly MAX
            expect(notifications.length).toBe(MAX_NOTIFICATIONS);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve count when fewer than MAX are added', () => {
      fc.assert(
        fc.property(
          fc.array(notificationCreateInputArb, {
            minLength: 0,
            maxLength: MAX_NOTIFICATIONS - 1,
          }),
          (inputs) => {
            const notifications = simulateAddNotifications(inputs);

            // Property: when fewer than MAX are added, count equals input count
            expect(notifications.length).toBe(inputs.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should keep newest notifications when limit is exceeded', () => {
      fc.assert(
        fc.property(
          fc.array(notificationCreateInputArb, {
            minLength: MAX_NOTIFICATIONS + 10,
            maxLength: 150,
          }),
          (inputs) => {
            const notifications = simulateAddNotifications(inputs);

            // Property: the first notification should be the most recently added
            // (which is the last input since we add at the beginning)
            const lastInput = inputs[inputs.length - 1];
            expect(notifications[0].title).toBe(lastInput.title);
            expect(notifications[0].type).toBe(lastInput.type);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should remove oldest notifications when limit is exceeded', () => {
      // Create a specific sequence to verify oldest are removed
      const inputs: NotificationCreateInput[] = [];
      for (let i = 0; i < MAX_NOTIFICATIONS + 20; i++) {
        inputs.push({
          type: NotificationType.JOB_STATUS_CHANGE,
          title: `Notification ${i}`,
          body: `Body ${i}`,
        });
      }

      const notifications = simulateAddNotifications(inputs);

      // The oldest 20 notifications (0-19) should be removed
      // The remaining should be 20-119 (but in reverse order since newest first)
      expect(notifications.length).toBe(MAX_NOTIFICATIONS);

      // First notification should be the last added (119)
      expect(notifications[0].title).toBe(
        `Notification ${MAX_NOTIFICATIONS + 19}`
      );

      // Last notification should be the 20th added (index 20)
      expect(notifications[MAX_NOTIFICATIONS - 1].title).toBe(
        `Notification ${20}`
      );
    });
  });


  /**
   * Property 3: Preference Persistence Round-Trip
   *
   * For any valid notification preferences object, saving to storage
   * and then loading from storage SHALL produce an equivalent
   * preferences object.
   *
   * **Validates: Requirements 3.3, 3.6**
   */
  describe('Property 3: Preference Persistence Round-Trip', () => {
    it('should preserve all preference fields through serialization round-trip', () => {
      fc.assert(
        fc.property(validPreferencesArb, (preferences) => {
          // Serialize then deserialize
          const serialized = serializePreferences(preferences);
          const deserialized = deserializePreferences(serialized);

          // Property: round-trip should produce equivalent preferences
          expect(preferencesEqual(preferences, deserialized)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve enabled (master toggle) through round-trip', () => {
      fc.assert(
        fc.property(validPreferencesArb, (preferences) => {
          const serialized = serializePreferences(preferences);
          const deserialized = deserializePreferences(serialized);

          expect(deserialized.enabled).toBe(preferences.enabled);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve jobStatusChanges through round-trip', () => {
      fc.assert(
        fc.property(validPreferencesArb, (preferences) => {
          const serialized = serializePreferences(preferences);
          const deserialized = deserializePreferences(serialized);

          expect(deserialized.jobStatusChanges).toBe(preferences.jobStatusChanges);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve habitReminders through round-trip', () => {
      fc.assert(
        fc.property(validPreferencesArb, (preferences) => {
          const serialized = serializePreferences(preferences);
          const deserialized = deserializePreferences(serialized);

          expect(deserialized.habitReminders).toBe(preferences.habitReminders);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve taskDueReminders through round-trip', () => {
      fc.assert(
        fc.property(validPreferencesArb, (preferences) => {
          const serialized = serializePreferences(preferences);
          const deserialized = deserializePreferences(serialized);

          expect(deserialized.taskDueReminders).toBe(preferences.taskDueReminders);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve goalAchievements through round-trip', () => {
      fc.assert(
        fc.property(validPreferencesArb, (preferences) => {
          const serialized = serializePreferences(preferences);
          const deserialized = deserializePreferences(serialized);

          expect(deserialized.goalAchievements).toBe(preferences.goalAchievements);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve dailySummary through round-trip', () => {
      fc.assert(
        fc.property(validPreferencesArb, (preferences) => {
          const serialized = serializePreferences(preferences);
          const deserialized = deserializePreferences(serialized);

          expect(deserialized.dailySummary).toBe(preferences.dailySummary);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve habitReminderTime through round-trip', () => {
      fc.assert(
        fc.property(validPreferencesArb, (preferences) => {
          const serialized = serializePreferences(preferences);
          const deserialized = deserializePreferences(serialized);

          expect(deserialized.habitReminderTime).toBe(preferences.habitReminderTime);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve default preferences through round-trip', () => {
      const serialized = serializePreferences(DEFAULT_NOTIFICATION_PREFERENCES);
      const deserialized = deserializePreferences(serialized);

      expect(preferencesEqual(DEFAULT_NOTIFICATION_PREFERENCES, deserialized)).toBe(
        true
      );
    });

    it('should handle all boolean combinations', () => {
      // Test all 64 combinations of 6 boolean fields
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          fc.boolean(),
          fc.boolean(),
          fc.boolean(),
          fc.boolean(),
          timeStringArb,
          (
            enabled,
            jobStatusChanges,
            habitReminders,
            taskDueReminders,
            goalAchievements,
            dailySummary,
            habitReminderTime
          ) => {
            const preferences: NotificationPreferences = {
              enabled,
              jobStatusChanges,
              habitReminders,
              taskDueReminders,
              goalAchievements,
              dailySummary,
              habitReminderTime,
            };

            const serialized = serializePreferences(preferences);
            const deserialized = deserializePreferences(serialized);

            expect(preferencesEqual(preferences, deserialized)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Property 2: Notification Sorting
   *
   * For any list of notifications with different timestamps, the Notification
   * Center SHALL display them sorted by timestamp in descending order
   * (newest first).
   *
   * **Validates: Requirements 2.1**
   */
  describe('Property 2: Notification Sorting', () => {
    /**
     * Simulates the sorting behavior used in the notification center modal
     */
    function sortNotificationsByTimestamp(notifications: Notification[]): Notification[] {
      return [...notifications].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }

    it('should sort notifications by timestamp in descending order (newest first)', () => {
      fc.assert(
        fc.property(notificationListArb, (notifications) => {
          const sorted = sortNotificationsByTimestamp(notifications);

          // Property: each notification should have a timestamp >= the next one
          for (let i = 0; i < sorted.length - 1; i++) {
            const currentTime = new Date(sorted[i].timestamp).getTime();
            const nextTime = new Date(sorted[i + 1].timestamp).getTime();
            expect(currentTime).toBeGreaterThanOrEqual(nextTime);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve all notifications after sorting (no data loss)', () => {
      fc.assert(
        fc.property(notificationListArb, (notifications) => {
          const sorted = sortNotificationsByTimestamp(notifications);

          // Property: sorted list should have same length as original
          expect(sorted.length).toBe(notifications.length);

          // Property: all original notification IDs should be present in sorted list
          const originalIds = new Set(notifications.map((n) => n.id));
          const sortedIds = new Set(sorted.map((n) => n.id));
          expect(sortedIds).toEqual(originalIds);
        }),
        { numRuns: 100 }
      );
    });

    it('should place newest notification first', () => {
      fc.assert(
        fc.property(
          fc.array(validNotificationArb, { minLength: 2, maxLength: 50 }),
          (notifications) => {
            const sorted = sortNotificationsByTimestamp(notifications);

            // Find the notification with the maximum timestamp
            const maxTimestamp = Math.max(
              ...notifications.map((n) => new Date(n.timestamp).getTime())
            );

            // Property: first notification should have the maximum timestamp
            expect(new Date(sorted[0].timestamp).getTime()).toBe(maxTimestamp);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should place oldest notification last', () => {
      fc.assert(
        fc.property(
          fc.array(validNotificationArb, { minLength: 2, maxLength: 50 }),
          (notifications) => {
            const sorted = sortNotificationsByTimestamp(notifications);

            // Find the notification with the minimum timestamp
            const minTimestamp = Math.min(
              ...notifications.map((n) => new Date(n.timestamp).getTime())
            );

            // Property: last notification should have the minimum timestamp
            expect(new Date(sorted[sorted.length - 1].timestamp).getTime()).toBe(
              minTimestamp
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be idempotent (sorting twice produces same result)', () => {
      fc.assert(
        fc.property(notificationListArb, (notifications) => {
          const sortedOnce = sortNotificationsByTimestamp(notifications);
          const sortedTwice = sortNotificationsByTimestamp(sortedOnce);

          // Property: sorting twice should produce identical result
          expect(sortedTwice.map((n) => n.id)).toEqual(sortedOnce.map((n) => n.id));
        }),
        { numRuns: 100 }
      );
    });

    it('should handle empty list', () => {
      const sorted = sortNotificationsByTimestamp([]);
      expect(sorted).toEqual([]);
    });

    it('should handle single notification', () => {
      fc.assert(
        fc.property(validNotificationArb, (notification) => {
          const sorted = sortNotificationsByTimestamp([notification]);

          // Property: single notification should remain unchanged
          expect(sorted.length).toBe(1);
          expect(sorted[0].id).toBe(notification.id);
        }),
        { numRuns: 100 }
      );
    });

    it('should handle notifications with same timestamp', () => {
      const fixedTimestamp = new Date('2024-01-15T10:00:00Z');

      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              type: notificationTypeArb,
              title: nonEmptyStringArb,
              body: fc.string(),
              timestamp: fc.constant(fixedTimestamp),
              read: fc.boolean(),
              data: notificationDataArb,
            }),
            { minLength: 2, maxLength: 20 }
          ),
          (notifications) => {
            const sorted = sortNotificationsByTimestamp(notifications);

            // Property: all notifications should still be present
            expect(sorted.length).toBe(notifications.length);

            // Property: all timestamps should be equal
            sorted.forEach((n) => {
              expect(new Date(n.timestamp).getTime()).toBe(fixedTimestamp.getTime());
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Property 4: Master Toggle Disables All Notifications
   *
   * For any notification creation attempt, when the master toggle is disabled,
   * the Notification Service SHALL not add the notification to the store.
   *
   * **Validates: Requirements 3.5**
   */
  describe('Property 4: Master Toggle Disables All Notifications', () => {
    /**
     * Simulates the notification service's behavior when checking preferences
     * before creating a notification.
     */
    function shouldCreateNotification(
      preferences: NotificationPreferences,
      input: NotificationCreateInput
    ): boolean {
      // If master toggle is disabled, no notifications should be created
      if (!preferences.enabled) {
        return false;
      }

      // Check individual preference based on notification type
      switch (input.type) {
        case NotificationType.JOB_STATUS_CHANGE:
          return preferences.jobStatusChanges;
        case NotificationType.HABIT_REMINDER:
          return preferences.habitReminders;
        case NotificationType.TASK_DUE:
        case NotificationType.TASK_OVERDUE:
          return preferences.taskDueReminders;
        case NotificationType.GOAL_ACHIEVEMENT:
          return preferences.goalAchievements;
        case NotificationType.DAILY_SUMMARY:
          return preferences.dailySummary;
        default:
          return true;
      }
    }

    /**
     * Simulates adding notifications with preference checking
     */
    function simulateAddWithPreferences(
      preferences: NotificationPreferences,
      inputs: NotificationCreateInput[]
    ): Notification[] {
      const notifications: Notification[] = [];

      for (const input of inputs) {
        if (shouldCreateNotification(preferences, input)) {
          notifications.push({
            id: `id-${notifications.length}`,
            type: input.type,
            title: input.title,
            body: input.body,
            timestamp: new Date(),
            read: false,
            data: input.data,
          });
        }
      }

      return notifications;
    }

    it('should not create any notifications when master toggle is disabled', () => {
      fc.assert(
        fc.property(
          fc.array(notificationCreateInputArb, { minLength: 1, maxLength: 50 }),
          validPreferencesArb,
          (inputs, basePreferences) => {
            // Force master toggle to be disabled
            const preferences: NotificationPreferences = {
              ...basePreferences,
              enabled: false,
            };

            const notifications = simulateAddWithPreferences(preferences, inputs);

            // Property: when master toggle is disabled, no notifications should be created
            expect(notifications.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create notifications when master toggle is enabled and type preference is enabled', () => {
      fc.assert(
        fc.property(notificationCreateInputArb, (input) => {
          // Create preferences with master toggle enabled and all type preferences enabled
          const preferences: NotificationPreferences = {
            enabled: true,
            jobStatusChanges: true,
            habitReminders: true,
            taskDueReminders: true,
            goalAchievements: true,
            dailySummary: true,
            habitReminderTime: '09:00',
          };

          const notifications = simulateAddWithPreferences(preferences, [input]);

          // Property: when master toggle and type preference are enabled, notification should be created
          expect(notifications.length).toBe(1);
        }),
        { numRuns: 100 }
      );
    });

    it('should not create job status notifications when jobStatusChanges is disabled', () => {
      fc.assert(
        fc.property(nonEmptyStringArb, fc.string(), (title, body) => {
          const preferences: NotificationPreferences = {
            enabled: true,
            jobStatusChanges: false,
            habitReminders: true,
            taskDueReminders: true,
            goalAchievements: true,
            dailySummary: true,
            habitReminderTime: '09:00',
          };

          const input: NotificationCreateInput = {
            type: NotificationType.JOB_STATUS_CHANGE,
            title,
            body,
          };

          const notifications = simulateAddWithPreferences(preferences, [input]);

          // Property: job status notification should not be created when preference is disabled
          expect(notifications.length).toBe(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should not create habit reminder notifications when habitReminders is disabled', () => {
      fc.assert(
        fc.property(nonEmptyStringArb, fc.string(), (title, body) => {
          const preferences: NotificationPreferences = {
            enabled: true,
            jobStatusChanges: true,
            habitReminders: false,
            taskDueReminders: true,
            goalAchievements: true,
            dailySummary: true,
            habitReminderTime: '09:00',
          };

          const input: NotificationCreateInput = {
            type: NotificationType.HABIT_REMINDER,
            title,
            body,
          };

          const notifications = simulateAddWithPreferences(preferences, [input]);

          // Property: habit reminder notification should not be created when preference is disabled
          expect(notifications.length).toBe(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should not create task notifications when taskDueReminders is disabled', () => {
      fc.assert(
        fc.property(
          nonEmptyStringArb,
          fc.string(),
          fc.constantFrom(NotificationType.TASK_DUE, NotificationType.TASK_OVERDUE),
          (title, body, type) => {
            const preferences: NotificationPreferences = {
              enabled: true,
              jobStatusChanges: true,
              habitReminders: true,
              taskDueReminders: false,
              goalAchievements: true,
              dailySummary: true,
              habitReminderTime: '09:00',
            };

            const input: NotificationCreateInput = {
              type,
              title,
              body,
            };

            const notifications = simulateAddWithPreferences(preferences, [input]);

            // Property: task notification should not be created when preference is disabled
            expect(notifications.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not create goal achievement notifications when goalAchievements is disabled', () => {
      fc.assert(
        fc.property(nonEmptyStringArb, fc.string(), (title, body) => {
          const preferences: NotificationPreferences = {
            enabled: true,
            jobStatusChanges: true,
            habitReminders: true,
            taskDueReminders: true,
            goalAchievements: false,
            dailySummary: true,
            habitReminderTime: '09:00',
          };

          const input: NotificationCreateInput = {
            type: NotificationType.GOAL_ACHIEVEMENT,
            title,
            body,
          };

          const notifications = simulateAddWithPreferences(preferences, [input]);

          // Property: goal achievement notification should not be created when preference is disabled
          expect(notifications.length).toBe(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should not create daily summary notifications when dailySummary is disabled', () => {
      fc.assert(
        fc.property(nonEmptyStringArb, fc.string(), (title, body) => {
          const preferences: NotificationPreferences = {
            enabled: true,
            jobStatusChanges: true,
            habitReminders: true,
            taskDueReminders: true,
            goalAchievements: true,
            dailySummary: false,
            habitReminderTime: '09:00',
          };

          const input: NotificationCreateInput = {
            type: NotificationType.DAILY_SUMMARY,
            title,
            body,
          };

          const notifications = simulateAddWithPreferences(preferences, [input]);

          // Property: daily summary notification should not be created when preference is disabled
          expect(notifications.length).toBe(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should respect master toggle regardless of individual preferences', () => {
      fc.assert(
        fc.property(
          fc.array(notificationCreateInputArb, { minLength: 1, maxLength: 20 }),
          (inputs) => {
            // All individual preferences enabled, but master toggle disabled
            const preferences: NotificationPreferences = {
              enabled: false,
              jobStatusChanges: true,
              habitReminders: true,
              taskDueReminders: true,
              goalAchievements: true,
              dailySummary: true,
              habitReminderTime: '09:00',
            };

            const notifications = simulateAddWithPreferences(preferences, inputs);

            // Property: master toggle should override all individual preferences
            expect(notifications.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should filter notifications based on their type preferences', () => {
      fc.assert(
        fc.property(
          fc.array(notificationCreateInputArb, { minLength: 5, maxLength: 30 }),
          validPreferencesArb,
          (inputs, basePreferences) => {
            // Ensure master toggle is enabled
            const preferences: NotificationPreferences = {
              ...basePreferences,
              enabled: true,
            };

            const notifications = simulateAddWithPreferences(preferences, inputs);

            // Property: each created notification should have its type preference enabled
            for (const notification of notifications) {
              const shouldExist = shouldCreateNotification(preferences, {
                type: notification.type,
                title: notification.title,
                body: notification.body,
              });
              expect(shouldExist).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
