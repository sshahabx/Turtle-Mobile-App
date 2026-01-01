# Requirements Document

## Introduction

This document specifies the requirements for a comprehensive notification service in the Turtle mobile application. The feature enables users to receive in-app and push notifications for various events (job status changes, habit reminders, task due dates, goal achievements) and provides granular control over notification preferences through the profile settings screen. A notification icon will be added adjacent to the search icon in the dashboard header for quick access to notifications.

## Glossary

- **Notification_Service**: The core service responsible for managing, scheduling, and delivering notifications to users
- **Notification_Preferences**: User-configurable settings that control which types of notifications are enabled or disabled
- **Notification_Center**: The UI component displaying a list of all notifications, accessible via the notification icon
- **Push_Notification**: System-level notifications delivered through Expo's push notification service
- **In_App_Notification**: Notifications displayed within the app UI (badges, banners, notification center)
- **Notification_Badge**: A visual indicator showing the count of unread notifications
- **Notification_Store**: Zustand store managing notification state and preferences with persistence
- **Notification_Type**: Categories of notifications (job_status, habit_reminder, task_due, goal_achievement, daily_summary)

## Requirements

### Requirement 1: Notification Icon in Dashboard Header

**User Story:** As a user, I want to see a notification icon next to the search icon in the dashboard header, so that I can quickly access my notifications.

#### Acceptance Criteria

1. THE Dashboard_Header SHALL display a notification icon adjacent to the search icon
2. WHEN the user has unread notifications, THE Notification_Badge SHALL display the count of unread notifications on the icon
3. WHEN the unread count exceeds 99, THE Notification_Badge SHALL display "99+"
4. WHEN the user taps the notification icon, THE Notification_Center SHALL open as a modal screen
5. WHEN there are no unread notifications, THE Notification_Badge SHALL not be displayed

### Requirement 2: Notification Center

**User Story:** As a user, I want to view all my notifications in one place, so that I can stay informed about important updates.

#### Acceptance Criteria

1. THE Notification_Center SHALL display a scrollable list of notifications sorted by timestamp (newest first)
2. WHEN a notification is unread, THE Notification_Center SHALL display it with a visual indicator (dot or highlight)
3. WHEN the user taps a notification, THE Notification_Center SHALL mark it as read and navigate to the relevant screen
4. THE Notification_Center SHALL provide a "Mark all as read" action
5. THE Notification_Center SHALL provide a "Clear all" action to delete all notifications
6. WHEN there are no notifications, THE Notification_Center SHALL display an empty state with appropriate messaging
7. WHEN the user swipes left on a notification, THE Notification_Center SHALL reveal a delete action

### Requirement 3: Notification Preferences in Profile

**User Story:** As a user, I want to configure which notifications I receive from the profile settings, so that I can control my notification experience.

#### Acceptance Criteria

1. THE Profile_Screen SHALL display a "Notifications" settings section
2. THE Notification_Preferences SHALL include toggles for each notification type:
   - Job status changes (when a job moves to a new status)
   - Habit reminders (daily reminders for incomplete habits)
   - Task due date reminders (notifications for upcoming/overdue tasks)
   - Goal achievement celebrations (when daily goal is reached)
   - Daily summary (end-of-day summary of activity)
3. WHEN a user toggles a notification preference, THE Notification_Store SHALL persist the change immediately
4. THE Notification_Preferences SHALL include a master toggle to enable/disable all notifications
5. WHEN the master toggle is disabled, THE Notification_Service SHALL not deliver any notifications
6. THE Notification_Preferences SHALL persist across app restarts

### Requirement 4: Notification Types and Content

**User Story:** As a user, I want to receive relevant notifications about my job search activities, so that I stay informed and motivated.

#### Acceptance Criteria

1. WHEN a job status changes, THE Notification_Service SHALL create a notification with the job title, company, and new status
2. WHEN a habit is incomplete at the configured reminder time, THE Notification_Service SHALL create a reminder notification
3. WHEN a task is due within 24 hours, THE Notification_Service SHALL create a due date reminder notification
4. WHEN a task becomes overdue, THE Notification_Service SHALL create an overdue notification
5. WHEN the user reaches their daily job application goal, THE Notification_Service SHALL create a celebration notification
6. WHEN the day ends, THE Notification_Service SHALL create a daily summary notification with activity counts (if enabled)
7. EACH notification SHALL include a title, body, timestamp, type, and optional navigation target

### Requirement 5: Notification Storage and State Management

**User Story:** As a user, I want my notifications to be saved locally, so that I can view them even after closing the app.

#### Acceptance Criteria

1. THE Notification_Store SHALL persist notifications to local storage
2. THE Notification_Store SHALL maintain a maximum of 100 notifications (oldest removed when limit exceeded)
3. THE Notification_Store SHALL track read/unread status for each notification
4. THE Notification_Store SHALL provide methods to add, mark as read, and delete notifications
5. WHEN the app launches, THE Notification_Store SHALL restore notifications from local storage
6. THE Notification_Store SHALL serialize and deserialize notification data correctly (round-trip property)

### Requirement 6: Push Notification Integration

**User Story:** As a user, I want to receive push notifications even when the app is closed, so that I don't miss important updates.

#### Acceptance Criteria

1. WHEN the app launches for the first time, THE Notification_Service SHALL request push notification permissions
2. IF the user grants permission, THE Notification_Service SHALL register for push notifications with Expo
3. IF the user denies permission, THE Notification_Service SHALL gracefully degrade to in-app notifications only
4. WHEN a push notification is received while the app is in the background, THE system SHALL display it as a system notification
5. WHEN the user taps a push notification, THE app SHALL open and navigate to the relevant screen
6. THE Notification_Service SHALL handle notification permission status changes appropriately

### Requirement 7: Notification Scheduling

**User Story:** As a user, I want to receive habit reminders and task due date notifications at appropriate times, so that I can take action.

#### Acceptance Criteria

1. THE Notification_Service SHALL schedule habit reminder notifications for a configurable time (default: 9:00 AM)
2. THE Notification_Service SHALL schedule task due date reminders 24 hours before the due date
3. THE Notification_Service SHALL cancel scheduled notifications when the related item is completed or deleted
4. WHEN the user changes the reminder time preference, THE Notification_Service SHALL reschedule pending notifications
5. THE Notification_Service SHALL not schedule duplicate notifications for the same event

### Requirement 8: Error Handling

**User Story:** As a user, I want the notification system to handle errors gracefully, so that my app experience is not disrupted.

#### Acceptance Criteria

1. IF notification permission is denied, THEN THE Notification_Service SHALL log the status and continue without push notifications
2. IF notification scheduling fails, THEN THE Notification_Service SHALL retry once and log the error
3. IF notification storage fails, THEN THE Notification_Service SHALL display an in-app error message
4. IF push notification registration fails, THEN THE Notification_Service SHALL fall back to in-app notifications only
