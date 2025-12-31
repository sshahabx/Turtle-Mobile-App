# Requirements Document

## Introduction

This specification covers improvements to the mobile dashboard user experience for the Job Application Tracker app. The focus is on making the dashboard more mobile-friendly when dealing with many applications, adding collapsible status sections, implementing global search, fixing navigation issues, and ensuring status updates work correctly. The overall goal is a minimalistic, user-friendly interface that doesn't feel overwhelming.

## Glossary

- **Dashboard**: The main screen displaying job application statistics and grouped applications
- **Status_Section**: A collapsible group of job applications organized by their current status (Applied, Interviewing, Offered, etc.)
- **Global_Search**: A search bar that filters job applications across all statuses by title, company, or notes
- **Job_Card**: A compact card displaying job title, company, and status information
- **Tab_Bar**: The bottom navigation bar with icons for Dashboard, Notes, Tasks, Habits, and Profile
- **Job_Detail_Screen**: The screen showing full details of a single job application
- **Back_Navigation**: UI element allowing users to return to the previous screen

## Requirements

### Requirement 1: Collapsible Status Sections

**User Story:** As a user with many job applications, I want to see my applications grouped by status in collapsible sections, so that I can quickly navigate to the status I care about without endless scrolling.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Dashboard SHALL display job applications grouped by status in collapsible sections
2. WHEN a user taps on a Status_Section header, THE Dashboard SHALL toggle the expanded/collapsed state of that section
3. WHILE a Status_Section is collapsed, THE Dashboard SHALL display only the status name and count of applications
4. WHILE a Status_Section is expanded, THE Dashboard SHALL display all Job_Cards within that status
5. THE Dashboard SHALL persist the expanded/collapsed state of each Status_Section during the session
6. THE Dashboard SHALL display status sections in priority order: Accepted, Offered, Interviewing, Applied, Pending, Rejected

### Requirement 2: Global Search

**User Story:** As a user, I want to search across all my job applications from the dashboard, so that I can quickly find a specific application without manually scrolling.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Dashboard SHALL display a Global_Search bar prominently at the top
2. WHEN a user types in the Global_Search bar, THE Dashboard SHALL filter Job_Cards to show only matching results
3. THE Global_Search SHALL match against job title, company name, and notes fields
4. WHEN the search query is empty, THE Dashboard SHALL display all jobs in their grouped status sections
5. WHEN search results are displayed, THE Dashboard SHALL show matching jobs in a flat list with status badges
6. IF no jobs match the search query, THEN THE Dashboard SHALL display an empty state message

### Requirement 3: Tab Bar Alignment Fix

**User Story:** As a user, I want the bottom tab bar to be properly aligned and visually consistent, so that navigation feels polished and professional.

#### Acceptance Criteria

1. THE Tab_Bar SHALL have consistent icon and label alignment across all tabs
2. THE Tab_Bar SHALL have proper padding to avoid overlap with device safe areas
3. THE Tab_Bar icons SHALL be vertically centered within their touch targets
4. THE Tab_Bar labels SHALL be consistently positioned below their respective icons

### Requirement 4: Status Update Fix

**User Story:** As a user, I want to update the status of my job applications and see the changes reflected immediately, so that I can track my progress accurately.

#### Acceptance Criteria

1. WHEN a user taps a status button on the Job_Detail_Screen, THE System SHALL update the job's status in storage
2. WHEN a status update completes, THE Job_Detail_Screen SHALL reflect the new status immediately
3. WHEN a user returns to the Dashboard after a status update, THE Dashboard SHALL display the job in its new status section
4. IF a status update fails, THEN THE System SHALL display an error message and maintain the previous status

### Requirement 5: Back Navigation from Job Detail

**User Story:** As a user viewing a job application's details, I want a clear way to navigate back to the dashboard, so that I don't feel trapped on the detail screen.

#### Acceptance Criteria

1. THE Job_Detail_Screen SHALL display a visible Back_Navigation element in the header
2. WHEN a user taps the Back_Navigation element, THE System SHALL navigate back to the Dashboard
3. THE Back_Navigation element SHALL be positioned in the top-left corner following platform conventions
4. THE Back_Navigation element SHALL have adequate touch target size for easy tapping

### Requirement 6: Minimalistic UI/UX

**User Story:** As a user, I want the dashboard to feel clean and uncluttered, so that managing my job applications doesn't feel like a burden.

#### Acceptance Criteria

1. THE Dashboard SHALL use consistent spacing and typography throughout
2. THE Dashboard SHALL avoid visual clutter by limiting information density per screen
3. THE Job_Card SHALL display only essential information: title, company, and relative date
4. THE Dashboard SHALL use subtle animations for expand/collapse transitions
5. THE Dashboard SHALL maintain adequate whitespace between UI elements
6. THE Dashboard SHALL use a calm, neutral color palette that doesn't overwhelm
