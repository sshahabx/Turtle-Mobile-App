# Implementation Plan: UI Consistency with Web App

## Overview

This implementation plan covers updating the Turtle mobile app's UI to match the JobAppTracker web application. Tasks are organized to build incrementally, starting with foundational theme configuration, then font integration, splash screen updates, and finally component styling updates.

## Tasks

- [x] 1. Update app configuration for Turtle branding
  - Update app.json with name "Turtle", slug "turtle", scheme "turtle"
  - Update splash screen configuration with smaller logo size
  - Ensure iOS and Android splash configurations are consistent
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 2.4_

- [x] 2. Set up Outfit font integration
  - [x] 2.1 Download and add Outfit font files to assets/fonts
    - Add Outfit-Light.ttf, Outfit-Regular.ttf, Outfit-Medium.ttf
    - Add Outfit-SemiBold.ttf, Outfit-Bold.ttf, Outfit-ExtraBold.ttf
    - _Requirements: 1.2_

  - [x] 2.2 Create font loading hook and update app layout
    - Create useFonts hook with expo-font
    - Update _layout.tsx to load fonts before rendering
    - Add loading state while fonts load
    - _Requirements: 1.1, 1.3, 1.4_

- [x] 3. Create centralized theme system
  - [x] 3.1 Create theme/colors.ts with zinc-based color palette
    - Define light mode colors matching web app
    - Define dark mode colors matching web app
    - Define status colors for job statuses
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Create theme/typography.ts with font configuration
    - Define font family with Outfit and fallback
    - Define font weights (300-800)
    - Define font sizes and line heights
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 3.3 Create theme/spacing.ts and theme/borderRadius.ts
    - Define spacing scale matching web app
    - Define border radius values (6, 8, 12, 16, 24)
    - _Requirements: 4.1, 4.2_

  - [ ]* 3.4 Write property test for color palette consistency
    - **Property 2: Color Palette Consistency**
    - **Validates: Requirements 3.1, 3.5**

  - [ ]* 3.5 Write property test for WCAG contrast compliance
    - **Property 5: WCAG Contrast Compliance**
    - **Validates: Requirements 5.4**

- [x] 4. Update splash screen with Turtle branding
  - [x] 4.1 Create custom splash screen component
    - Display "Turtle" text with Outfit-Bold font
    - Display logo at 64px size
    - Support light and dark mode backgrounds
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 4.2 Update app/index.tsx to use new splash screen
    - Replace current splash content with Turtle branding
    - Ensure smooth transition to main app
    - _Requirements: 2.5_

- [ ] 5. Checkpoint - Verify font and theme setup
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update UI components with consistent styling
  - [x] 6.1 Update Button component
    - Apply Outfit-SemiBold font
    - Set borderRadius to 12
    - Update colors to use theme
    - _Requirements: 4.4, 1.3_

  - [x] 6.2 Update Card component
    - Set borderRadius to 16
    - Apply subtle border and shadow
    - Update colors to use theme
    - _Requirements: 4.3, 1.3_

  - [x] 6.3 Update Input component
    - Set borderRadius to 8
    - Apply consistent border and padding
    - Update colors to use theme
    - _Requirements: 4.5, 1.3_

  - [x] 6.4 Update Badge component
    - Set borderRadius to 6
    - Apply Outfit-Medium font
    - Update status colors
    - _Requirements: 4.4, 3.5_

  - [ ]* 6.5 Write property test for component border radius
    - **Property 3: Component Border Radius Consistency**
    - **Validates: Requirements 4.1**

- [x] 7. Update remaining screens and components
  - [x] 7.1 Update dashboard components (StatsHeader, DailyProgress, JobCard)
    - Apply Outfit font throughout
    - Update colors to use theme
    - _Requirements: 1.3, 3.1_

  - [x] 7.2 Update form components (JobForm, TaskForm, NoteForm, HabitForm)
    - Apply consistent typography
    - Update input styling
    - _Requirements: 1.3, 4.5_

  - [x] 7.3 Update tab layout and navigation
    - Apply Outfit font to tab labels
    - Update colors to match theme
    - _Requirements: 1.3, 3.1_

  - [ ]* 7.4 Write property test for typography consistency
    - **Property 4: Typography Scale Consistency**
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Font files need to be downloaded from Google Fonts (Outfit)
