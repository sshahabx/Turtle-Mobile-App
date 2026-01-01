# Requirements Document

## Introduction

The Career Journey (Forest Map) feature provides a calm, story-driven visualization of a user's job search and career progression. This signed-in-only feature displays a vertically scrollable forest-style map where progression unfolds from bottom to top, with each accepted job marking the completion of a level. The experience emphasizes reflection over gamification, creating a personal journal-like narrative of the user's career path.

## Glossary

- **Journey_Map**: The main vertically scrollable forest-style visualization component that displays the user's career progression
- **Level**: A chapter in the user's career journey, starting with Level 0 (Job Hunt) and incrementing with each accepted job offer
- **Milestone_Node**: A visual marker on the forest path representing a key achievement or activity within a level
- **Career_Score**: A cumulative point total reflecting meaningful user actions, displayed subtly without competitive framing
- **Forest_Path**: The visual trail connecting milestone nodes, extending as the user progresses
- **Node_Overlay**: A small contextual popup that appears when tapping a milestone node, showing relevant information
- **Point_Threshold**: A Career Score value that triggers visual environmental changes in the journey map

## Requirements

### Requirement 1: Journey Tab Access Control

**User Story:** As a signed-in user, I want to access a dedicated Journey section, so that I can view my career progression visualization.

#### Acceptance Criteria

1. WHEN a user is authenticated, THE Journey_Map SHALL be accessible as a top-level tab in the dashboard navigation
2. WHEN a user is not authenticated, THE Journey_Map tab SHALL NOT be visible in the navigation
3. WHEN a user signs out while viewing the Journey_Map, THE System SHALL redirect them to the sign-in screen

### Requirement 2: Forest Map Visualization

**User Story:** As a user, I want to see my career journey as a forest path, so that I can visualize my progress in a calm, narrative way.

#### Acceptance Criteria

1. THE Journey_Map SHALL render as a vertically scrollable view with progression from bottom to top
2. THE Journey_Map SHALL display a forest-themed visual path connecting milestone nodes
3. THE Journey_Map SHALL use calm, neutral colors consistent with the app's zinc-based palette
4. THE Journey_Map SHALL implement slow animations and soft transitions for all visual changes
5. WHEN the Journey_Map loads, THE System SHALL scroll to the user's current position on the path

### Requirement 3: Level System

**User Story:** As a user, I want my accepted jobs to mark career chapters, so that I can see distinct phases of my job search journey.

#### Acceptance Criteria

1. THE System SHALL initialize all users at Level 0 titled "Job Hunt"
2. WHEN a user accepts a job offer, THE System SHALL complete the current level and create a new level
3. THE System SHALL increment level numbers sequentially (Level 0, Level 1, Level 2, etc.)
4. THE System SHALL persist all completed levels as viewable historical chapters
5. WHEN viewing a completed level, THE Journey_Map SHALL display it as a distinct completed section on the path
6. THE System SHALL display the level title and completion date for each completed level

### Requirement 4: Milestone Nodes

**User Story:** As a user, I want to see my activities represented as nodes on the path, so that I can track meaningful moments in my journey.

#### Acceptance Criteria

1. THE Journey_Map SHALL display milestone nodes for: first job application, 10th application, 25th application, 50th application, first interview, first offer received, and accepted offer
2. THE Milestone_Node SHALL remain locked until the corresponding activity is completed
3. WHEN a milestone is achieved, THE Milestone_Node SHALL unlock with a subtle animation (fade in or gentle glow)
4. WHEN a Milestone_Node unlocks, THE Forest_Path SHALL extend visually to connect to the new node
5. THE Milestone_Node SHALL display a distinct visual state for locked, unlocked, and current milestones

### Requirement 5: Node Interaction

**User Story:** As a user, I want to tap on milestone nodes to see details, so that I can reflect on specific moments in my journey.

#### Acceptance Criteria

1. WHEN a user taps an unlocked Milestone_Node, THE System SHALL display a Node_Overlay
2. THE Node_Overlay SHALL show contextual information including milestone title, achievement date, and relevant statistics
3. THE Node_Overlay SHALL include an optional short reflection text field for user notes
4. WHEN a user taps outside the Node_Overlay, THE System SHALL dismiss the overlay
5. IF a user taps a locked Milestone_Node, THEN THE System SHALL display a subtle hint about how to unlock it

### Requirement 6: Career Score System

**User Story:** As a user, I want to earn points for meaningful actions, so that I can see my overall engagement reflected in my journey.

#### Acceptance Criteria

1. THE System SHALL award points only for: adding a new job application, completing a daily task, and completing a habit for the day
2. THE System SHALL accumulate points into a Career_Score that persists across sessions
3. THE Career_Score SHALL be displayed subtly in the Journey section header
4. THE System SHALL NOT reset points or penalize user inactivity
5. THE System SHALL NOT display leaderboards or competitive comparisons
6. THE Career_Score display SHALL use reflective language (e.g., "Your Journey" not "Your Rank")

### Requirement 7: Visual Progression Rewards

**User Story:** As a user, I want my journey map to evolve visually as I progress, so that I feel a sense of growth without competitive pressure.

#### Acceptance Criteria

1. WHEN a user reaches defined Point_Threshold values, THE Journey_Map SHALL unlock subtle visual changes
2. THE visual changes SHALL include: new forest area themes, clearer path visibility, and subtle environmental shifts
3. THE visual transitions SHALL animate slowly and smoothly without jarring effects
4. THE System SHALL NOT use bright colors, badges, or streak pressure indicators
5. THE System SHALL NOT play sounds by default for any progression events

### Requirement 8: Data Persistence

**User Story:** As a user, I want my journey progress to be saved, so that I can return and see my complete history.

#### Acceptance Criteria

1. THE System SHALL persist Career_Score, completed levels, unlocked milestones, and node reflections
2. WHEN a user signs in on a new device, THE System SHALL restore their complete journey state
3. THE System SHALL sync journey data with the backend for authenticated users
4. IF network connectivity is lost, THEN THE System SHALL queue updates and sync when connectivity returns

### Requirement 9: Design Aesthetic

**User Story:** As a user, I want the journey experience to feel calm and personal, so that it supports reflection rather than stress.

#### Acceptance Criteria

1. THE Journey_Map SHALL use the app's existing zinc-based neutral color palette
2. THE Journey_Map SHALL avoid bright accent colors except for the primary emerald theme
3. THE Journey_Map SHALL NOT display aggressive gamification elements (badges, streaks with penalties, countdown timers)
4. THE Journey_Map typography SHALL use the Outfit font family consistent with the app
5. THE Journey_Map SHALL feel like a personal journal rather than a productivity tracker
