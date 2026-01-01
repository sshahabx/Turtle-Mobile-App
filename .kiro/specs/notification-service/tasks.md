# Implementation Plan: Notification Service

## Overview

This implementation plan breaks down the notification service feature into discrete, incremental tasks. Each task builds on previous work, ensuring no orphaned code. The implementation follows the modular architecture defined in the design document.

## Tasks

- [x] 1. Set up notification types and data models
  - [x] 1.1 Create notification types file with NotificationType enum and interfaces
    - Create `types/notifications.ts` with Notification, NotificationPreferences, NotificationCreateInput interfaces
    - Export NotificationType enum with all notification categories
    - _Requirements: 4.7, 5.3_

  - [x] 1.2 Write property test for notification structure invariant
    - **Property 8: Notification Structure Invariant**
    - **Validates: Requirements 4.7, 5.3**

- [x] 2. Implement notification store with persistence
  - [x] 2.1 Create notification store with Zustand
    - Create `store/notificationStore.ts` with state and actions
    - Implement addNotification, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications
    - Implement updatePreferences action
    - Add persistence to AsyncStorage
    - Enforce max 100 notifications limit (remove oldest when exceeded)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 2.2 Write property test for notification storage round-trip
    - **Property 9: Notification Storage Round-Trip**
    - **Validates: Requirements 5.1, 5.5, 5.6**

  - [x] 2.3 Write property test for max notifications limit
    - **Property 10: Maximum Notifications Limit**
    - **Validates: Requirements 5.2**

  - [x] 2.4 Write property test for preference persistence round-trip
    - **Property 3: Preference Persistence Round-Trip**
    - **Validates: Requirements 3.3, 3.6**

- [ ] 3. Checkpoint - Ensure store tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement notification badge component
  - [x] 4.1 Create NotificationBadge component
    - Create `components/ui/NotificationBadge.tsx`
    - Display count, show "99+" for counts > 99
    - Hide badge when count is 0
    - Style with theme colors
    - _Requirements: 1.2, 1.3, 1.5_

  - [x] 4.2 Write property test for badge count accuracy
    - **Property 1: Badge Count Accuracy**
    - **Validates: Requirements 1.2, 1.3, 1.5**

- [x] 5. Implement notification icon in dashboard header
  - [x] 5.1 Create NotificationIcon component
    - Create `components/ui/NotificationIcon.tsx`
    - Integrate NotificationBadge
    - Handle onPress to open notification center
    - _Requirements: 1.1, 1.4_

  - [x] 5.2 Add notification icon to dashboard header
    - Modify `app/(tabs)/index.tsx` to add notification icon adjacent to search icon
    - Wire up unread count from notification store
    - _Requirements: 1.1, 1.2_

- [x] 6. Implement notification center modal
  - [x] 6.1 Create notification center modal screen
    - Create `app/modals/notifications.tsx`
    - Display scrollable list of notifications sorted by timestamp (newest first)
    - Show unread indicator for unread notifications
    - Implement swipe-to-delete gesture
    - Add "Mark all as read" header action
    - Add "Clear all" header action
    - Display empty state when no notifications
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 6.2 Write property test for notification sorting
    - **Property 2: Notification Sorting**
    - **Validates: Requirements 2.1**

  - [x] 6.3 Add navigation from notification icon to modal
    - Update NotificationIcon to navigate to notifications modal
    - Handle notification tap to navigate to relevant screen
    - _Requirements: 1.4, 2.3_

- [ ] 7. Checkpoint - Ensure UI components work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement notification preferences in profile
  - [x] 8.1 Create NotificationPreferences component
    - Create `components/notifications/NotificationPreferences.tsx`
    - Add master toggle for all notifications
    - Add individual toggles for each notification type
    - Add time picker for habit reminder time
    - Wire up to notification store
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 8.2 Add notification preferences section to profile screen
    - Modify `app/(tabs)/profile.tsx` to include NotificationPreferences
    - Add "Notifications" section header
    - _Requirements: 3.1, 3.2_

  - [x] 8.3 Write property test for master toggle behavior
    - **Property 4: Master Toggle Disables All Notifications**
    - **Validates: Requirements 3.5**

- [x] 9. Implement core notification service
  - [x] 9.1 Create notification service with creation methods
    - Create `services/notifications/notificationService.ts`
    - Implement createJobStatusNotification
    - Implement createHabitReminderNotification
    - Implement createTaskDueNotification
    - Implement createTaskOverdueNotification
    - Implement createGoalAchievementNotification
    - Implement createDailySummaryNotification
    - Check preferences before creating notifications
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 9.2 Write property test for job status notification content
    - **Property 5: Job Status Notification Content**
    - **Validates: Requirements 4.1**

  - [x] 9.3 Write property test for task notification timing
    - **Property 6: Task Notification Timing**
    - **Validates: Requirements 4.3, 4.4**

  - [x] 9.4 Write property test for goal achievement trigger
    - **Property 7: Goal Achievement Trigger**
    - **Validates: Requirements 4.5**

- [x] 10. Implement notification scheduling
  - [x] 10.1 Add scheduling methods to notification service
    - Implement scheduleHabitReminders using Expo Notifications
    - Implement scheduleTaskReminders (24 hours before due date)
    - Implement cancelScheduledNotification
    - Handle rescheduling when reminder time changes
    - Prevent duplicate scheduling
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 10.2 Write property test for task reminder scheduling calculation
    - **Property 11: Task Reminder Scheduling Calculation**
    - **Validates: Requirements 7.2**

  - [x] 10.3 Write property test for no duplicate scheduling
    - **Property 13: No Duplicate Scheduling (Idempotence)**
    - **Validates: Requirements 7.5**

  - [x] 10.4 Write property test for notification cancellation on delete
    - **Property 12: Notification Cancellation on Delete**
    - **Validates: Requirements 7.3**

- [x] 11. Checkpoint - Ensure notification service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement push notification integration
  - [x] 12.1 Add push notification setup to notification service
    - Implement requestPermissions method
    - Implement registerForPushNotifications method
    - Implement handleNotificationReceived handler
    - Implement handleNotificationResponse handler for navigation
    - Add graceful degradation when permissions denied
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 12.2 Update app.json with push notification configuration
    - Add expo-notifications plugin
    - Configure notification permissions for iOS and Android
    - _Requirements: 6.1, 6.2_

  - [x] 12.3 Initialize notification service in app layout
    - Modify `app/_layout.tsx` to initialize notification service on app launch
    - Request permissions on first launch
    - Set up notification listeners
    - _Requirements: 6.1, 6.4, 6.5_

- [x] 13. Integrate notifications with existing features
  - [x] 13.1 Add job status change notifications
    - Modify `features/jobs/hooks/useJobs.ts` to trigger notification on status change
    - _Requirements: 4.1_

  - [x] 13.2 Add goal achievement notifications
    - Modify `features/user/hooks/useGoalAchievement.ts` to trigger notification
    - _Requirements: 4.5_

  - [x] 13.3 Add task due date notifications
    - Modify `features/tasks/hooks/useTasks.ts` to schedule/cancel notifications
    - _Requirements: 4.3, 4.4, 7.2, 7.3_

  - [x] 13.4 Add habit reminder notifications
    - Modify `features/habits/hooks/useHabits.ts` to schedule/cancel notifications
    - _Requirements: 4.2, 7.1, 7.3_

- [x] 14. Implement error handling
  - [x] 14.1 Add error handling to notification service
    - Handle permission denied gracefully
    - Implement retry logic for scheduling failures
    - Handle storage failures with toast messages
    - Handle push registration failures with fallback
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 15. Final checkpoint - Full integration testing
  - Ensure all tests pass, ask the user if questions arise.
  - Verify notification icon appears in dashboard header
  - Verify notification center opens and displays notifications
  - Verify preferences persist and control notification behavior
  - Verify push notifications work when app is backgrounded

## Notes

- All tasks are required including property-based tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation uses Expo Notifications for push notification support
- Jest with fast-check is used for property-based testing
