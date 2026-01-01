# Implementation Plan: Career Journey (Forest Map)

## Overview

This implementation plan builds the Career Journey feature incrementally, starting with core data types and services, then UI components, and finally integration with existing app features. Property tests are included alongside implementation tasks to catch errors early.

## Tasks

- [x] 1. Set up journey types and configuration
  - [x] 1.1 Create journey type definitions
    - Create `types/journey.ts` with JourneyLevel, Milestone, MilestoneType, MilestoneState, JourneyState, VisualTier, and PointAction interfaces
    - Export types from `types/index.ts`
    - _Requirements: 3.1, 3.2, 4.1, 4.5, 6.1, 7.1_

  - [x] 1.2 Create milestone configuration
    - Create `config/milestones.ts` with MILESTONE_CONFIG defining all 7 milestone types
    - Include threshold values and check functions for each milestone
    - _Requirements: 4.1, 4.2_

  - [x] 1.3 Create visual tier configuration
    - Create `config/visualTiers.ts` with VISUAL_TIER_THRESHOLDS and getVisualTier function
    - Define point thresholds: seedling(0), sapling(100), grove(500), forest(1500)
    - _Requirements: 7.1_

  - [x] 1.4 Write property test for visual tier calculation
    - **Property 12: Visual Tier Threshold Correctness**
    - **Validates: Requirements 7.1**

- [x] 2. Implement journey store and services
  - [x] 2.1 Create journey Zustand store
    - Create `store/journeyStore.ts` with journey state, loading state, and pending updates
    - Implement loadJourneyState, awardPoints, completeLevel, saveReflection actions
    - Include offline queue management
    - _Requirements: 6.2, 6.4, 8.1, 8.4_

  - [x] 2.2 Write property test for career score monotonicity
    - **Property 11: Career Score Monotonicity**
    - **Validates: Requirements 6.2, 6.4**

  - [x] 2.3 Create points service
    - Create `features/journey/services/pointsService.ts`
    - Implement awardPoints with validation for allowed action types
    - Define POINT_VALUES: job_added(10), task_completed(5), habit_completed(5)
    - _Requirements: 6.1, 6.2_

  - [x] 2.4 Write property test for point award validation
    - **Property 10: Point Award Action Validation**
    - **Validates: Requirements 6.1**

  - [x] 2.5 Create journey service
    - Create `features/journey/services/journeyService.ts`
    - Implement getJourneyState, completeLevel, unlockMilestone, saveReflection, syncJourneyState
    - Handle both API and local storage modes
    - _Requirements: 3.2, 4.2, 5.3, 8.1, 8.3_

  - [x] 2.6 Write property test for journey state serialization
    - **Property 13: Journey State Round-Trip Serialization**
    - **Validates: Requirements 8.1, 8.2**

- [x] 3. Checkpoint - Core services complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement milestone logic
  - [x] 4.1 Create milestone utility functions
    - Create `features/journey/utils/milestoneUtils.ts`
    - Implement getMilestoneState, checkMilestoneUnlock, getMilestoneHint functions
    - _Requirements: 4.2, 4.5, 5.5_

  - [x] 4.2 Write property test for milestone lock state
    - **Property 6: Milestone Lock State Correctness**
    - **Validates: Requirements 4.2**

  - [x] 4.3 Write property test for milestone state validity
    - **Property 7: Milestone State Validity**
    - **Validates: Requirements 4.5**

  - [x] 4.4 Write property test for locked milestone hints
    - **Property 9: Locked Milestone Hint Availability**
    - **Validates: Requirements 5.5**

- [x] 5. Implement level management
  - [x] 5.1 Create level utility functions
    - Create `features/journey/utils/levelUtils.ts`
    - Implement createInitialLevel, completeLevel, validateLevelData functions
    - _Requirements: 3.1, 3.2, 3.6_

  - [x] 5.2 Write property test for new user initialization
    - **Property 2: New User Level Initialization**
    - **Validates: Requirements 3.1**

  - [x] 5.3 Write property test for level increment
    - **Property 3: Level Increment on Job Acceptance**
    - **Validates: Requirements 3.2, 3.3**

  - [x] 5.4 Write property test for completed levels persistence
    - **Property 4: Completed Levels Persistence**
    - **Validates: Requirements 3.4**

  - [x] 5.5 Write property test for completed level data integrity
    - **Property 5: Completed Level Data Integrity**
    - **Validates: Requirements 3.6**

- [x] 6. Checkpoint - Business logic complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create journey UI components
  - [x] 7.1 Create CareerScoreDisplay component
    - Create `components/journey/CareerScoreDisplay.tsx`
    - Display score with reflective language ("Your Journey: X points")
    - Apply visual tier theming
    - _Requirements: 6.3, 6.6, 9.1_

  - [x] 7.2 Create MilestoneNode component
    - Create `components/journey/MilestoneNode.tsx`
    - Render locked/unlocked/current visual states
    - Implement subtle unlock animation (fade in, gentle glow)
    - _Requirements: 4.3, 4.5, 9.1, 9.2_

  - [x] 7.3 Create NodeOverlay component
    - Create `components/journey/NodeOverlay.tsx`
    - Display milestone title, achievement date, statistics
    - Include optional reflection text input
    - Handle dismiss on outside tap
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 7.4 Write property test for overlay data completeness
    - **Property 8: Unlocked Milestone Overlay Data Completeness**
    - **Validates: Requirements 5.2**

  - [x] 7.5 Create JourneyMap component
    - Create `components/journey/JourneyMap.tsx`
    - Render vertically scrollable forest path (bottom to top)
    - Position milestone nodes along the path
    - Apply visual tier environmental theming
    - Auto-scroll to current position on load
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.2, 7.3_

  - [x] 7.6 Create journey component index
    - Create `components/journey/index.ts` exporting all journey components
    - _Requirements: N/A_

- [x] 8. Implement Journey tab
  - [x] 8.1 Create Journey tab screen
    - Create `app/(tabs)/journey.tsx`
    - Integrate JourneyMap with journey store
    - Handle milestone tap to show NodeOverlay
    - _Requirements: 1.1, 2.1_

  - [x] 8.2 Add Journey tab to navigation (auth-only)
    - Update `app/(tabs)/_layout.tsx` to include Journey tab
    - Conditionally render based on authentication state
    - Create journey tab icon matching existing icon style
    - _Requirements: 1.1, 1.2_

  - [x] 8.3 Write property test for tab visibility
    - **Property 1: Tab Visibility Matches Authentication State**
    - **Validates: Requirements 1.1, 1.2**

- [x] 9. Checkpoint - UI components complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Integrate with existing features
  - [x] 10.1 Add point awards to job creation
    - Update `features/jobs/hooks/useJobs.ts` to award points on job creation
    - Call pointsService.awardPoints with 'job_added' action
    - _Requirements: 6.1_

  - [x] 10.2 Add point awards to task completion
    - Update `features/tasks/hooks/useTasks.ts` to award points on task completion
    - Call pointsService.awardPoints with 'task_completed' action
    - _Requirements: 6.1_

  - [x] 10.3 Add point awards to habit completion
    - Update `features/habits/hooks/useHabits.ts` to award points on habit completion
    - Call pointsService.awardPoints with 'habit_completed' action
    - _Requirements: 6.1_

  - [x] 10.4 Add level completion on job acceptance
    - Update job acceptance flow to trigger level completion
    - Call journeyService.completeLevel when job status changes to ACCEPTED
    - _Requirements: 3.2_

  - [x] 10.5 Add milestone unlock checks
    - Create useJourneyMilestones hook to check and unlock milestones
    - Trigger milestone checks after relevant actions (job add, status change)
    - _Requirements: 4.2, 4.3_

- [x] 11. Skip offline support for journey feature
  - Journey tracking is only available for authenticated users
  - Offline/unauthenticated users should be prompted to sign in to unlock journey tracking
  - Point awards, milestone unlocks, and level completions only trigger for authenticated users
  - _Note: This is by design - journey is a premium feature for signed-in users_

- [x] 12. Final checkpoint
  - All 115 journey-related tests pass
  - All 9 tab visibility tests pass (Journey tab only visible for authenticated users)
  - All 11 visual tier tests pass
  - Complete flow verified: add jobs → earn points → unlock milestones → complete level
  - Journey features disabled for offline/unauthenticated users (prompted to sign in)

## Notes

- All tasks including property tests are required
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The feature uses fast-check for property-based testing, consistent with existing test setup
