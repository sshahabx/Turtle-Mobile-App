# Requirements Document

## Introduction

This document specifies the requirements for implementing free tier limits in the Job Application Tracker mobile app. The free tier (offline/local storage mode) provides limited functionality to encourage users to sign in for the full experience. Authenticated users (signed in with Google) get unlimited access to all features, while offline users have reasonable limits that still provide value but incentivize upgrading.

## Glossary

- **Free_Tier**: The offline/local storage mode where users continue without signing in
- **Premium_Tier**: The authenticated mode where users sign in with Google and get unlimited access
- **Usage_Limit**: Maximum number of items a Free_Tier user can create for a specific entity type
- **Limit_Banner**: A UI component that displays current usage and remaining capacity
- **Upgrade_Prompt**: A modal or banner encouraging users to sign in for unlimited access
- **Limit_Checker**: A service that validates whether a user can create new items based on their tier

## Requirements

### Requirement 1: Job Application Limits

**User Story:** As a free tier user, I want to track a limited number of job applications, so that I can try the app before committing to sign in.

#### Acceptance Criteria

1. WHILE in Free_Tier mode THEN the Limit_Checker SHALL enforce a maximum of 10 job applications
2. WHEN a Free_Tier user has reached the job limit THEN the Job_Tracker_Mobile SHALL display an Upgrade_Prompt instead of the add job form
3. WHEN displaying the jobs dashboard in Free_Tier mode THEN the Job_Tracker_Mobile SHALL show a Limit_Banner indicating "X of 10 jobs used"
4. WHEN a Free_Tier user attempts to add a job at the limit THEN the Job_Tracker_Mobile SHALL prevent creation and display the Upgrade_Prompt
5. WHEN a user is in Premium_Tier mode THEN the Limit_Checker SHALL allow unlimited job applications
6. WHEN a user signs in after using Free_Tier THEN the Job_Tracker_Mobile SHALL NOT migrate local data to the cloud (separate data stores)

### Requirement 2: Notes Limits

**User Story:** As a free tier user, I want to create a limited number of notes, so that I can organize my job search information within the free tier.

#### Acceptance Criteria

1. WHILE in Free_Tier mode THEN the Limit_Checker SHALL enforce a maximum of 5 notes
2. WHEN a Free_Tier user has reached the notes limit THEN the Job_Tracker_Mobile SHALL display an Upgrade_Prompt instead of the add note form
3. WHEN displaying the notes screen in Free_Tier mode THEN the Job_Tracker_Mobile SHALL show a Limit_Banner indicating "X of 5 notes used"
4. WHEN a Free_Tier user attempts to add a note at the limit THEN the Job_Tracker_Mobile SHALL prevent creation and display the Upgrade_Prompt
5. WHEN a user is in Premium_Tier mode THEN the Limit_Checker SHALL allow unlimited notes

### Requirement 3: Tasks Limits

**User Story:** As a free tier user, I want to create a limited number of tasks, so that I can manage my job search to-dos within the free tier.

#### Acceptance Criteria

1. WHILE in Free_Tier mode THEN the Limit_Checker SHALL enforce a maximum of 10 tasks
2. WHEN a Free_Tier user has reached the tasks limit THEN the Job_Tracker_Mobile SHALL display an Upgrade_Prompt instead of the add task form
3. WHEN displaying the tasks screen in Free_Tier mode THEN the Job_Tracker_Mobile SHALL show a Limit_Banner indicating "X of 10 tasks used"
4. WHEN a Free_Tier user attempts to add a task at the limit THEN the Job_Tracker_Mobile SHALL prevent creation and display the Upgrade_Prompt
5. WHEN a user is in Premium_Tier mode THEN the Limit_Checker SHALL allow unlimited tasks

### Requirement 4: Habits Limits

**User Story:** As a free tier user, I want to track a limited number of habits, so that I can build job search routines within the free tier.

#### Acceptance Criteria

1. WHILE in Free_Tier mode THEN the Limit_Checker SHALL enforce a maximum of 3 habits
2. WHEN a Free_Tier user has reached the habits limit THEN the Job_Tracker_Mobile SHALL display an Upgrade_Prompt instead of the add habit form
3. WHEN displaying the habits screen in Free_Tier mode THEN the Job_Tracker_Mobile SHALL show a Limit_Banner indicating "X of 3 habits used"
4. WHEN a Free_Tier user attempts to add a habit at the limit THEN the Job_Tracker_Mobile SHALL prevent creation and display the Upgrade_Prompt
5. WHEN a user is in Premium_Tier mode THEN the Limit_Checker SHALL allow unlimited habits

### Requirement 5: Upgrade Prompt UI

**User Story:** As a free tier user, I want to see a clear and non-intrusive upgrade prompt, so that I understand the benefits of signing in without feeling pressured.

#### Acceptance Criteria

1. WHEN displaying the Upgrade_Prompt THEN the Job_Tracker_Mobile SHALL show a calm, professional modal with clear value proposition
2. WHEN displaying the Upgrade_Prompt THEN the Job_Tracker_Mobile SHALL include a "Sign in with Google" button as the primary action
3. WHEN displaying the Upgrade_Prompt THEN the Job_Tracker_Mobile SHALL include a "Maybe later" dismiss option
4. WHEN a user taps "Sign in with Google" on the Upgrade_Prompt THEN the Job_Tracker_Mobile SHALL initiate the OAuth flow
5. WHEN a user dismisses the Upgrade_Prompt THEN the Job_Tracker_Mobile SHALL close the modal without further action
6. WHEN displaying the Upgrade_Prompt THEN the Job_Tracker_Mobile SHALL list key benefits: unlimited items, cloud sync, cross-device access

### Requirement 6: Limit Banner UI

**User Story:** As a free tier user, I want to see my current usage at a glance, so that I know how much capacity I have remaining.

#### Acceptance Criteria

1. WHEN displaying the Limit_Banner THEN the Job_Tracker_Mobile SHALL show current count and maximum limit (e.g., "3 of 10 jobs")
2. WHEN usage is below 70% of limit THEN the Limit_Banner SHALL use a neutral color scheme
3. WHEN usage is between 70% and 99% of limit THEN the Limit_Banner SHALL use a warning color scheme (amber)
4. WHEN usage is at 100% of limit THEN the Limit_Banner SHALL use an alert color scheme (red) and show "Limit reached"
5. WHEN a user taps the Limit_Banner THEN the Job_Tracker_Mobile SHALL display the Upgrade_Prompt
6. WHEN a user is in Premium_Tier mode THEN the Job_Tracker_Mobile SHALL NOT display the Limit_Banner

### Requirement 7: Limit Checking Service

**User Story:** As a developer, I want a centralized limit checking service, so that limits are enforced consistently across the app.

#### Acceptance Criteria

1. THE Limit_Checker SHALL provide a method to check if a user can create a new item of a given type
2. THE Limit_Checker SHALL return the current count and maximum limit for a given entity type
3. THE Limit_Checker SHALL determine tier status from the authentication state (isAuthenticated, isOfflineMode)
4. WHEN checking limits THEN the Limit_Checker SHALL query the local database for current counts in Free_Tier mode
5. THE Limit_Checker SHALL be implemented as a React hook for easy integration with components
