# Implementation Plan: Dashboard UX Improvements

## Overview

This plan implements dashboard improvements in incremental steps: search functionality, collapsible sections, navigation fixes, status update fixes, and UI polish. Each task builds on previous work and includes property-based tests for core logic.

## Tasks

- [x] 1. Implement search filter utility function
  - [x] 1.1 Create filterJobsBySearch function in jobUtils.ts
    - Add function that filters jobs by title, company, and notes fields
    - Handle case-insensitive matching
    - Return all jobs when query is empty
    - _Requirements: 2.2, 2.3, 2.4_
  - [ ]* 1.2 Write property test for search filter
    - **Property 4: Search Filter Matches on Title, Company, and Notes**
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 2. Implement SearchBar component
  - [x] 2.1 Create SearchBar component in components/ui/SearchBar.tsx
    - Controlled input with search icon and clear button
    - Use theme colors and typography
    - Include debounced onChange handler
    - _Requirements: 2.1_

- [x] 3. Implement CollapsibleStatusSection component
  - [x] 3.1 Create CollapsibleStatusSection component in components/dashboard/
    - Render status header with name, icon, and count badge
    - Toggle expanded/collapsed state on tap
    - Use LayoutAnimation for smooth transitions
    - Render JobCard list when expanded
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.4_
  - [ ]* 3.2 Write property test for toggle state
    - **Property 2: Toggle State Changes Correctly**
    - **Validates: Requirements 1.2**
  - [ ]* 3.3 Write property test for status count
    - **Property 3: Status Count Matches Job Count**
    - **Validates: Requirements 1.3**

- [-] 4. Update Dashboard screen with search and collapsible sections
  - [x] 4.1 Integrate SearchBar into Dashboard
    - Add search state and handler
    - Position below header, above stats
    - _Requirements: 2.1_
  - [x] 4.2 Replace current job list with CollapsibleStatusSection components
    - Use expanded sections state to track which are open
    - Filter jobs through search when query present
    - Show flat list with badges when searching, grouped sections otherwise
    - _Requirements: 1.1, 1.6, 2.5_
  - [ ]* 4.3 Write property test for job grouping
    - **Property 1: Job Grouping by Status is Accurate**
    - **Validates: Requirements 1.1, 4.3**

- [ ] 5. Checkpoint - Verify search and collapsible sections work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Fix back navigation on Job Detail screen
  - [x] 6.1 Add header with back button to Job Detail screen
    - Create header component with back arrow and title
    - Use router.back() for navigation
    - Ensure adequate touch target (44x44 minimum)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. Fix status update functionality
  - [x] 7.1 Debug and fix status update in Job Detail screen
    - Verify updateStatus mutation is called correctly
    - Ensure query invalidation triggers refetch
    - Add proper error handling with toast feedback
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ]* 7.2 Write property test for status update persistence
    - **Property 5: Status Update Persists Correctly**
    - **Validates: Requirements 4.1**

- [x] 8. Fix Tab Bar alignment
  - [x] 8.1 Update Tab Bar styles in _layout.tsx
    - Adjust paddingBottom for safe area
    - Center icons vertically
    - Ensure consistent spacing between icon and label
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 9. UI polish and minimalistic improvements
  - [x] 9.1 Update JobCard for cleaner display
    - Show only title, company, and relative date
    - Add status badge for search results mode
    - Use consistent spacing from theme
    - _Requirements: 6.3, 6.5_
  - [x] 9.2 Add empty state for search with no results
    - Display friendly message when no jobs match
    - Suggest adjusting search query
    - _Requirements: 2.6_

- [ ] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check library already in project
- Checkpoints ensure incremental validation
