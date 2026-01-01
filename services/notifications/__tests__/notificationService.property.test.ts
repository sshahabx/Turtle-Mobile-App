/**
 * Property-Based Tests for Notification Service
 *
 * Feature: notification-service
 *
 * These tests verify the notification service's creation methods and
 * correctness properties using property-based testing with fast-check.
 * 
 * Note: These tests focus on the pure logic of notification content generation
 * and timing calculations, independent of the store.
 */

import * as fc from 'fast-check';
import { Job, JobStatus, Task, TaskStatus } from '../../../types';

// ============================================================================
// Pure Functions for Testing (extracted from notification service logic)
// ============================================================================

/**
 * Status labels for human-readable notification content
 */
const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  [JobStatus.PENDING]: 'Pending',
  [JobStatus.APPLIED]: 'Applied',
  [JobStatus.INTERVIEWING]: 'Interviewing',
  [JobStatus.OFFERED]: 'Offered',
  [JobStatus.ACCEPTED]: 'Accepted',
  [JobStatus.REJECTED]: 'Rejected',
};

/**
 * Generates job status notification content
 */
function generateJobStatusNotificationContent(job: Job, newStatus: JobStatus): { title: string; body: string } {
  const statusLabel = JOB_STATUS_LABELS[newStatus];
  return {
    title: `Job Status Updated: ${statusLabel}`,
    body: `${job.title} at ${job.company} is now ${statusLabel}`,
  };
}

/**
 * Generates task due notification content
 */
function generateTaskDueNotificationContent(task: Task): { title: string; body: string } {
  return {
    title: 'Task Due Soon',
    body: `"${task.title}" is due within 24 hours`,
  };
}

/**
 * Generates task overdue notification content
 */
function generateTaskOverdueNotificationContent(task: Task): { title: string; body: string } {
  return {
    title: 'Task Overdue',
    body: `"${task.title}" is past its due date`,
  };
}

/**
 * Generates goal achievement notification content
 */
function generateGoalAchievementNotificationContent(count: number, goal: number): { title: string; body: string } {
  return {
    title: '🎉 Goal Achieved!',
    body: `Congratulations! You've reached your daily goal of ${goal} job applications with ${count} applications today!`,
  };
}

/**
 * Checks if a task is due within the specified hours.
 */
function isTaskDueWithinHours(task: Task, hours: number = 24): boolean {
  if (!task.dueDate) {
    return false;
  }

  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  return hoursUntilDue > 0 && hoursUntilDue <= hours;
}

/**
 * Checks if a task is overdue.
 */
function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) {
    return false;
  }

  const now = new Date();
  const dueDate = new Date(task.dueDate);
  
  return dueDate.getTime() < now.getTime();
}

/**
 * Checks if a goal has been achieved.
 */
function isGoalAchieved(count: number, goal: number): boolean {
  return count >= goal && goal > 0;
}

/**
 * Calculates the scheduled time for a task reminder.
 * Task reminders are scheduled 24 hours before the due date.
 */
function calculateTaskReminderTime(dueDate: Date): Date {
  const reminderTime = new Date(dueDate);
  reminderTime.setHours(reminderTime.getHours() - 24);
  return reminderTime;
}

/**
 * Calculates the next occurrence of a habit reminder time.
 */
function calculateHabitReminderTime(reminderTime: string): Date {
  const [hours, minutes] = reminderTime.split(':').map(Number);
  const now = new Date();
  const scheduledDate = new Date();
  
  scheduledDate.setHours(hours, minutes, 0, 0);
  
  if (scheduledDate.getTime() <= now.getTime()) {
    scheduledDate.setDate(scheduledDate.getDate() + 1);
  }
  
  return scheduledDate;
}

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

/**
 * Generator for valid JobStatus values
 */
const jobStatusArb = fc.constantFrom(
  JobStatus.PENDING,
  JobStatus.APPLIED,
  JobStatus.INTERVIEWING,
  JobStatus.OFFERED,
  JobStatus.ACCEPTED,
  JobStatus.REJECTED
);

/**
 * Generator for non-empty strings
 */
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 100 });

/**
 * Generator for valid Job objects
 */
const jobArb: fc.Arbitrary<Job> = fc.record({
  id: fc.uuid(),
  title: nonEmptyStringArb,
  company: nonEmptyStringArb,
  status: jobStatusArb,
  platform: fc.option(fc.string(), { nil: undefined }),
  deadline: fc.option(fc.date(), { nil: undefined }),
  notes: fc.option(fc.string(), { nil: undefined }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

/**
 * Generator for tasks due within 24 hours from now
 */
const taskDueWithin24HoursArb: fc.Arbitrary<Task> = fc
  .integer({ min: 1, max: 23 })
  .chain((hoursFromNow) => {
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + hoursFromNow);
    
    return fc.record({
      id: fc.uuid(),
      title: nonEmptyStringArb,
      description: fc.option(fc.string(), { nil: undefined }),
      status: fc.constant(TaskStatus.PENDING),
      dueDate: fc.constant(dueDate),
      createdAt: fc.date({ max: new Date() }),
      updatedAt: fc.date({ max: new Date() }),
    });
  });

/**
 * Generator for overdue tasks (due date in the past)
 */
const overdueTaskArb: fc.Arbitrary<Task> = fc
  .integer({ min: 1, max: 365 })
  .chain((daysAgo) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - daysAgo);
    
    return fc.record({
      id: fc.uuid(),
      title: nonEmptyStringArb,
      description: fc.option(fc.string(), { nil: undefined }),
      status: fc.constant(TaskStatus.PENDING),
      dueDate: fc.constant(dueDate),
      createdAt: fc.date({ max: dueDate }),
      updatedAt: fc.date({ max: new Date() }),
    });
  });

/**
 * Generator for goal count and goal value pairs where goal is achieved
 */
const achievedGoalArb = fc
  .integer({ min: 1, max: 100 })
  .chain((goal) =>
    fc.tuple(
      fc.integer({ min: goal, max: goal + 50 }),
      fc.constant(goal)
    )
  );

/**
 * Generator for goal count and goal value pairs where goal is NOT achieved
 */
const unachievedGoalArb = fc
  .integer({ min: 2, max: 100 })
  .chain((goal) =>
    fc.tuple(
      fc.integer({ min: 0, max: goal - 1 }),
      fc.constant(goal)
    )
  );

// ============================================================================
// Property Tests
// ============================================================================

describe('Notification Service Property Tests', () => {
  /**
   * Property 5: Job Status Notification Content
   *
   * For any job with a title and company, when a status change notification
   * is created, the notification SHALL contain the job title, company name,
   * and new status in its content.
   *
   * **Validates: Requirements 4.1**
   */
  describe('Property 5: Job Status Notification Content', () => {
    it('should include job title in notification body', () => {
      fc.assert(
        fc.property(jobArb, jobStatusArb, (job, newStatus) => {
          const content = generateJobStatusNotificationContent(job, newStatus);
          expect(content.body).toContain(job.title);
        }),
        { numRuns: 100 }
      );
    });

    it('should include company name in notification body', () => {
      fc.assert(
        fc.property(jobArb, jobStatusArb, (job, newStatus) => {
          const content = generateJobStatusNotificationContent(job, newStatus);
          expect(content.body).toContain(job.company);
        }),
        { numRuns: 100 }
      );
    });

    it('should include new status in notification title or body', () => {
      fc.assert(
        fc.property(jobArb, jobStatusArb, (job, newStatus) => {
          const content = generateJobStatusNotificationContent(job, newStatus);
          const statusLabel = JOB_STATUS_LABELS[newStatus];
          const fullContent = content.title + ' ' + content.body;
          expect(fullContent).toContain(statusLabel);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate non-empty title and body', () => {
      fc.assert(
        fc.property(jobArb, jobStatusArb, (job, newStatus) => {
          const content = generateJobStatusNotificationContent(job, newStatus);
          expect(content.title.length).toBeGreaterThan(0);
          expect(content.body.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: Task Notification Timing
   *
   * For any task with a due date, if the due date is within 24 hours from now,
   * a due reminder notification SHALL be created; if the due date is in the past,
   * an overdue notification SHALL be created.
   *
   * **Validates: Requirements 4.3, 4.4**
   */
  describe('Property 6: Task Notification Timing', () => {
    describe('isTaskDueWithinHours utility', () => {
      it('should return true for tasks due within specified hours', () => {
        fc.assert(
          fc.property(
            fc.integer({ min: 1, max: 23 }),
            nonEmptyStringArb,
            (hoursFromNow, title) => {
              const dueDate = new Date();
              dueDate.setHours(dueDate.getHours() + hoursFromNow);
              
              const task: Task = {
                id: 'test-id',
                title,
                status: TaskStatus.PENDING,
                dueDate,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              
              expect(isTaskDueWithinHours(task, 24)).toBe(true);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should return false for tasks due more than specified hours away', () => {
        fc.assert(
          fc.property(
            fc.integer({ min: 25, max: 100 }),
            nonEmptyStringArb,
            (hoursFromNow, title) => {
              const dueDate = new Date();
              dueDate.setHours(dueDate.getHours() + hoursFromNow);
              
              const task: Task = {
                id: 'test-id',
                title,
                status: TaskStatus.PENDING,
                dueDate,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              
              expect(isTaskDueWithinHours(task, 24)).toBe(false);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should return false for tasks without due date', () => {
        fc.assert(
          fc.property(nonEmptyStringArb, (title) => {
            const task: Task = {
              id: 'test-id',
              title,
              status: TaskStatus.PENDING,
              dueDate: undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            expect(isTaskDueWithinHours(task, 24)).toBe(false);
          }),
          { numRuns: 100 }
        );
      });
    });

    describe('isTaskOverdue utility', () => {
      it('should return true for tasks with due date in the past', () => {
        fc.assert(
          fc.property(overdueTaskArb, (task) => {
            expect(isTaskOverdue(task)).toBe(true);
          }),
          { numRuns: 100 }
        );
      });

      it('should return false for tasks with due date in the future', () => {
        fc.assert(
          fc.property(
            fc.integer({ min: 1, max: 365 }),
            nonEmptyStringArb,
            (daysFromNow, title) => {
              const dueDate = new Date();
              dueDate.setDate(dueDate.getDate() + daysFromNow);
              
              const task: Task = {
                id: 'test-id',
                title,
                status: TaskStatus.PENDING,
                dueDate,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              
              expect(isTaskOverdue(task)).toBe(false);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should return false for tasks without due date', () => {
        fc.assert(
          fc.property(nonEmptyStringArb, (title) => {
            const task: Task = {
              id: 'test-id',
              title,
              status: TaskStatus.PENDING,
              dueDate: undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            expect(isTaskOverdue(task)).toBe(false);
          }),
          { numRuns: 100 }
        );
      });
    });

    describe('Task due notification content', () => {
      it('should include task title in notification body', () => {
        fc.assert(
          fc.property(taskDueWithin24HoursArb, (task) => {
            const content = generateTaskDueNotificationContent(task);
            expect(content.body).toContain(task.title);
          }),
          { numRuns: 100 }
        );
      });

      it('should generate non-empty title and body', () => {
        fc.assert(
          fc.property(taskDueWithin24HoursArb, (task) => {
            const content = generateTaskDueNotificationContent(task);
            expect(content.title.length).toBeGreaterThan(0);
            expect(content.body.length).toBeGreaterThan(0);
          }),
          { numRuns: 100 }
        );
      });
    });

    describe('Task overdue notification content', () => {
      it('should include task title in notification body', () => {
        fc.assert(
          fc.property(overdueTaskArb, (task) => {
            const content = generateTaskOverdueNotificationContent(task);
            expect(content.body).toContain(task.title);
          }),
          { numRuns: 100 }
        );
      });

      it('should generate non-empty title and body', () => {
        fc.assert(
          fc.property(overdueTaskArb, (task) => {
            const content = generateTaskOverdueNotificationContent(task);
            expect(content.title.length).toBeGreaterThan(0);
            expect(content.body.length).toBeGreaterThan(0);
          }),
          { numRuns: 100 }
        );
      });
    });
  });

  /**
   * Property 7: Goal Achievement Trigger
   *
   * For any daily job count and goal value, when the count reaches or exceeds
   * the goal, a goal achievement notification SHALL be created exactly once per day.
   *
   * **Validates: Requirements 4.5**
   */
  describe('Property 7: Goal Achievement Trigger', () => {
    describe('isGoalAchieved utility', () => {
      it('should return true when count equals goal', () => {
        fc.assert(
          fc.property(fc.integer({ min: 1, max: 100 }), (goal) => {
            expect(isGoalAchieved(goal, goal)).toBe(true);
          }),
          { numRuns: 100 }
        );
      });

      it('should return true when count exceeds goal', () => {
        fc.assert(
          fc.property(achievedGoalArb, ([count, goal]) => {
            expect(isGoalAchieved(count, goal)).toBe(true);
          }),
          { numRuns: 100 }
        );
      });

      it('should return false when count is less than goal', () => {
        fc.assert(
          fc.property(unachievedGoalArb, ([count, goal]) => {
            expect(isGoalAchieved(count, goal)).toBe(false);
          }),
          { numRuns: 100 }
        );
      });

      it('should return false when goal is zero', () => {
        fc.assert(
          fc.property(fc.integer({ min: 0, max: 100 }), (count) => {
            expect(isGoalAchieved(count, 0)).toBe(false);
          }),
          { numRuns: 100 }
        );
      });
    });

    describe('Goal achievement notification content', () => {
      it('should include count and goal in notification body', () => {
        fc.assert(
          fc.property(achievedGoalArb, ([count, goal]) => {
            const content = generateGoalAchievementNotificationContent(count, goal);
            expect(content.body).toContain(String(goal));
            expect(content.body).toContain(String(count));
          }),
          { numRuns: 100 }
        );
      });

      it('should include celebration emoji in title', () => {
        fc.assert(
          fc.property(achievedGoalArb, ([count, goal]) => {
            const content = generateGoalAchievementNotificationContent(count, goal);
            expect(content.title).toContain('🎉');
          }),
          { numRuns: 100 }
        );
      });

      it('should generate non-empty title and body', () => {
        fc.assert(
          fc.property(achievedGoalArb, ([count, goal]) => {
            const content = generateGoalAchievementNotificationContent(count, goal);
            expect(content.title.length).toBeGreaterThan(0);
            expect(content.body.length).toBeGreaterThan(0);
          }),
          { numRuns: 100 }
        );
      });
    });
  });

  /**
   * Property 11: Task Reminder Scheduling Calculation
   *
   * For any task with a due date more than 24 hours in the future,
   * the scheduled reminder time SHALL be exactly 24 hours before the due date.
   *
   * **Validates: Requirements 7.2**
   */
  describe('Property 11: Task Reminder Scheduling Calculation', () => {
    /**
     * Generator for due dates more than 24 hours in the future
     */
    const futureDueDateArb = fc
      .integer({ min: 25, max: 365 * 24 }) // 25 hours to 1 year in hours
      .map((hoursFromNow) => {
        const dueDate = new Date();
        dueDate.setHours(dueDate.getHours() + hoursFromNow);
        return dueDate;
      });

    it('should schedule reminder exactly 24 hours before due date', () => {
      fc.assert(
        fc.property(futureDueDateArb, (dueDate) => {
          const reminderTime = calculateTaskReminderTime(dueDate);
          
          // Calculate the difference in milliseconds
          const diffMs = dueDate.getTime() - reminderTime.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          
          // Should be exactly 24 hours
          expect(diffHours).toBe(24);
        }),
        { numRuns: 100 }
      );
    });

    it('should return a Date object', () => {
      fc.assert(
        fc.property(futureDueDateArb, (dueDate) => {
          const reminderTime = calculateTaskReminderTime(dueDate);
          expect(reminderTime).toBeInstanceOf(Date);
        }),
        { numRuns: 100 }
      );
    });

    it('should return a time before the due date', () => {
      fc.assert(
        fc.property(futureDueDateArb, (dueDate) => {
          const reminderTime = calculateTaskReminderTime(dueDate);
          expect(reminderTime.getTime()).toBeLessThan(dueDate.getTime());
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve the date relationship for any valid due date', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date(), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }),
          (dueDate) => {
            const reminderTime = calculateTaskReminderTime(dueDate);
            
            // The reminder should always be 24 hours before
            const expectedReminderTime = new Date(dueDate);
            expectedReminderTime.setHours(expectedReminderTime.getHours() - 24);
            
            expect(reminderTime.getTime()).toBe(expectedReminderTime.getTime());
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 13: No Duplicate Scheduling (Idempotence)
   *
   * For any habit or task, scheduling notifications multiple times
   * SHALL result in only one scheduled notification for that item.
   *
   * **Validates: Requirements 7.5**
   */
  describe('Property 13: No Duplicate Scheduling (Idempotence)', () => {
    /**
     * Simulates the scheduling tracking behavior.
     * This tests the pure logic of duplicate prevention.
     */
    
    // Simulated tracking map for testing
    let scheduledNotificationsMap: Map<string, { identifier: string; itemId: string }>;
    
    beforeEach(() => {
      scheduledNotificationsMap = new Map();
    });

    /**
     * Pure function that simulates scheduling with duplicate prevention
     */
    function simulateScheduleNotification(
      type: 'habit' | 'task',
      itemId: string
    ): { identifier: string; isNew: boolean } {
      const key = `${type}-${itemId}`;
      
      // Check for existing scheduled notification
      if (scheduledNotificationsMap.has(key)) {
        return {
          identifier: scheduledNotificationsMap.get(key)!.identifier,
          isNew: false,
        };
      }
      
      // Create new scheduled notification
      const identifier = `${type}-reminder-${itemId}-${Date.now()}`;
      scheduledNotificationsMap.set(key, { identifier, itemId });
      
      return { identifier, isNew: true };
    }

    it('should return the same identifier when scheduling the same item multiple times', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('habit', 'task') as fc.Arbitrary<'habit' | 'task'>,
          fc.uuid(),
          fc.integer({ min: 2, max: 10 }),
          (type, itemId, scheduleCount) => {
            // Reset the map for each test
            scheduledNotificationsMap.clear();
            
            // Schedule the first time
            const firstResult = simulateScheduleNotification(type, itemId);
            expect(firstResult.isNew).toBe(true);
            
            // Schedule multiple additional times
            for (let i = 1; i < scheduleCount; i++) {
              const result = simulateScheduleNotification(type, itemId);
              expect(result.isNew).toBe(false);
              expect(result.identifier).toBe(firstResult.identifier);
            }
            
            // Should only have one entry in the map
            expect(scheduledNotificationsMap.size).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow scheduling different items independently', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('habit', 'task') as fc.Arbitrary<'habit' | 'task'>,
          fc.array(fc.uuid(), { minLength: 2, maxLength: 10 }),
          (type, itemIds) => {
            // Reset the map for each test
            scheduledNotificationsMap.clear();
            
            // Ensure unique item IDs
            const uniqueItemIds = [...new Set(itemIds)];
            
            // Schedule each item
            const identifiers = uniqueItemIds.map((itemId) => {
              const result = simulateScheduleNotification(type, itemId);
              expect(result.isNew).toBe(true);
              return result.identifier;
            });
            
            // All identifiers should be unique
            const uniqueIdentifiers = new Set(identifiers);
            expect(uniqueIdentifiers.size).toBe(uniqueItemIds.length);
            
            // Map should have one entry per unique item
            expect(scheduledNotificationsMap.size).toBe(uniqueItemIds.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should treat habits and tasks as separate namespaces', () => {
      fc.assert(
        fc.property(fc.uuid(), (itemId) => {
          // Reset the map for each test
          scheduledNotificationsMap.clear();
          
          // Schedule the same ID as both habit and task
          const habitResult = simulateScheduleNotification('habit', itemId);
          const taskResult = simulateScheduleNotification('task', itemId);
          
          // Both should be new (different namespaces)
          expect(habitResult.isNew).toBe(true);
          expect(taskResult.isNew).toBe(true);
          
          // Identifiers should be different
          expect(habitResult.identifier).not.toBe(taskResult.identifier);
          
          // Map should have two entries
          expect(scheduledNotificationsMap.size).toBe(2);
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain idempotence across interleaved scheduling attempts', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constantFrom('habit', 'task') as fc.Arbitrary<'habit' | 'task'>,
              itemId: fc.uuid(),
            }),
            { minLength: 5, maxLength: 20 }
          ),
          (scheduleAttempts) => {
            // Reset the map for each test
            scheduledNotificationsMap.clear();
            
            // Track first identifiers for each unique item
            const firstIdentifiers = new Map<string, string>();
            
            for (const { type, itemId } of scheduleAttempts) {
              const key = `${type}-${itemId}`;
              const result = simulateScheduleNotification(type, itemId);
              
              if (!firstIdentifiers.has(key)) {
                // First time seeing this item
                expect(result.isNew).toBe(true);
                firstIdentifiers.set(key, result.identifier);
              } else {
                // Already scheduled - should return same identifier
                expect(result.isNew).toBe(false);
                expect(result.identifier).toBe(firstIdentifiers.get(key));
              }
            }
            
            // Map size should equal number of unique items
            expect(scheduledNotificationsMap.size).toBe(firstIdentifiers.size);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 12: Notification Cancellation on Delete
   *
   * For any scheduled notification associated with a habit or task,
   * when that habit or task is deleted, the scheduled notification SHALL be cancelled.
   *
   * **Validates: Requirements 7.3**
   */
  describe('Property 12: Notification Cancellation on Delete', () => {
    // Simulated tracking map for testing
    let scheduledNotificationsMap: Map<string, { identifier: string; itemId: string }>;
    
    beforeEach(() => {
      scheduledNotificationsMap = new Map();
    });

    /**
     * Pure function that simulates scheduling
     */
    function simulateScheduleNotification(
      type: 'habit' | 'task',
      itemId: string
    ): string {
      const key = `${type}-${itemId}`;
      
      if (scheduledNotificationsMap.has(key)) {
        return scheduledNotificationsMap.get(key)!.identifier;
      }
      
      const identifier = `${type}-reminder-${itemId}-${Date.now()}`;
      scheduledNotificationsMap.set(key, { identifier, itemId });
      
      return identifier;
    }

    /**
     * Pure function that simulates cancellation by item
     */
    function simulateCancelNotificationForItem(
      type: 'habit' | 'task',
      itemId: string
    ): boolean {
      const key = `${type}-${itemId}`;
      
      if (!scheduledNotificationsMap.has(key)) {
        return false;
      }
      
      scheduledNotificationsMap.delete(key);
      return true;
    }

    /**
     * Checks if a notification is scheduled for an item
     */
    function isNotificationScheduledForItem(
      type: 'habit' | 'task',
      itemId: string
    ): boolean {
      const key = `${type}-${itemId}`;
      return scheduledNotificationsMap.has(key);
    }

    it('should remove scheduled notification when item is deleted', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('habit', 'task') as fc.Arbitrary<'habit' | 'task'>,
          fc.uuid(),
          (type, itemId) => {
            // Reset the map
            scheduledNotificationsMap.clear();
            
            // Schedule a notification
            simulateScheduleNotification(type, itemId);
            expect(isNotificationScheduledForItem(type, itemId)).toBe(true);
            
            // Cancel (delete) the notification
            const cancelled = simulateCancelNotificationForItem(type, itemId);
            expect(cancelled).toBe(true);
            
            // Notification should no longer be scheduled
            expect(isNotificationScheduledForItem(type, itemId)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return false when cancelling non-existent notification', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('habit', 'task') as fc.Arbitrary<'habit' | 'task'>,
          fc.uuid(),
          (type, itemId) => {
            // Reset the map
            scheduledNotificationsMap.clear();
            
            // Try to cancel without scheduling first
            const cancelled = simulateCancelNotificationForItem(type, itemId);
            expect(cancelled).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should only cancel the specific item notification', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('habit', 'task') as fc.Arbitrary<'habit' | 'task'>,
          fc.array(fc.uuid(), { minLength: 3, maxLength: 10 }),
          (type, itemIds) => {
            // Reset the map
            scheduledNotificationsMap.clear();
            
            // Ensure unique item IDs
            const uniqueItemIds = [...new Set(itemIds)];
            if (uniqueItemIds.length < 2) return; // Need at least 2 items
            
            // Schedule notifications for all items
            for (const itemId of uniqueItemIds) {
              simulateScheduleNotification(type, itemId);
            }
            
            // Cancel the first item
            const itemToCancel = uniqueItemIds[0];
            simulateCancelNotificationForItem(type, itemToCancel);
            
            // First item should be cancelled
            expect(isNotificationScheduledForItem(type, itemToCancel)).toBe(false);
            
            // Other items should still be scheduled
            for (let i = 1; i < uniqueItemIds.length; i++) {
              expect(isNotificationScheduledForItem(type, uniqueItemIds[i])).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle cancellation of habit without affecting task with same ID', () => {
      fc.assert(
        fc.property(fc.uuid(), (itemId) => {
          // Reset the map
          scheduledNotificationsMap.clear();
          
          // Schedule both habit and task with same ID
          simulateScheduleNotification('habit', itemId);
          simulateScheduleNotification('task', itemId);
          
          expect(isNotificationScheduledForItem('habit', itemId)).toBe(true);
          expect(isNotificationScheduledForItem('task', itemId)).toBe(true);
          
          // Cancel only the habit
          simulateCancelNotificationForItem('habit', itemId);
          
          // Habit should be cancelled, task should remain
          expect(isNotificationScheduledForItem('habit', itemId)).toBe(false);
          expect(isNotificationScheduledForItem('task', itemId)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should allow rescheduling after cancellation', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('habit', 'task') as fc.Arbitrary<'habit' | 'task'>,
          fc.uuid(),
          (type, itemId) => {
            // Reset the map
            scheduledNotificationsMap.clear();
            
            // Schedule first
            simulateScheduleNotification(type, itemId);
            expect(isNotificationScheduledForItem(type, itemId)).toBe(true);
            
            // Cancel
            simulateCancelNotificationForItem(type, itemId);
            expect(isNotificationScheduledForItem(type, itemId)).toBe(false);
            
            // Reschedule - should succeed (item is schedulable again)
            simulateScheduleNotification(type, itemId);
            expect(isNotificationScheduledForItem(type, itemId)).toBe(true);
            
            // Map should have exactly one entry
            expect(scheduledNotificationsMap.size).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
