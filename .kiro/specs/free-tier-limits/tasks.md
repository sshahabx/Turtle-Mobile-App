# Implementation Plan: Free Tier Limits

## Overview

This plan implements the freemium model with limits for offline/free tier users. The implementation follows a bottom-up approach: configuration → service → hook → UI components → integration.

## Tasks

- [x] 1. Create limit configuration and types
  - Create `config/limits.ts` with `FREE_TIER_LIMITS` constants and `EntityType` type
  - Define `LimitStatus` interface with currentCount, maxLimit, canCreate, usagePercentage, isAtLimit
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 2. Implement useLimits hook
  - [x] 2.1 Create the useLimits hook in `hooks/useLimits.ts`
    - Import useAuth for tier detection (isAuthenticated, isOfflineMode)
    - Import database functions to get entity counts
    - Return LimitStatus with canCreate, currentCount, maxLimit, usagePercentage, isAtLimit, isFreeTier
    - For Premium tier, return unlimited (canCreate: true, maxLimit: Infinity)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 2.2 Write property test for limit enforcement (Property 1)
    - **Property 1: Free Tier Limit Enforcement**
    - **Validates: Requirements 1.1, 1.4, 2.1, 2.4, 3.1, 3.4, 4.1, 4.4**

  - [x] 2.3 Write property test for premium unlimited access (Property 2)
    - **Property 2: Premium Tier Unlimited Access**
    - **Validates: Requirements 1.5, 2.5, 3.5, 4.5**

- [x] 3. Implement utility functions
  - [x] 3.1 Create `utils/limitUtils.ts` with helper functions
    - `calculateUsagePercentage(current: number, max: number): number`
    - `getColorScheme(percentage: number): 'neutral' | 'warning' | 'alert'`
    - `formatLimitText(current: number, max: number, label: string): string`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 3.2 Write property test for usage percentage calculation (Property 3)
    - **Property 3: Usage Percentage Calculation**
    - **Validates: Requirements 6.1, 7.2**

  - [x] 3.3 Write property test for color scheme selection (Property 4)
    - **Property 4: Color Scheme Selection**
    - **Validates: Requirements 6.2, 6.3, 6.4**

- [x] 4. Implement LimitBanner component
  - [x] 4.1 Create `components/ui/LimitBanner.tsx`
    - Accept entityType and entityLabel props
    - Use useLimits hook to get current status
    - Display "X of Y {label}" text
    - Apply color scheme based on usage percentage
    - Make tappable to show upgrade prompt
    - Hide for Premium tier users
    - _Requirements: 1.3, 2.3, 3.3, 4.3, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 4.2 Write property test for banner visibility (Property 5)
    - **Property 5: Banner Visibility by Tier**
    - **Validates: Requirements 6.6**

- [x] 5. Implement UpgradePrompt component
  - [x] 5.1 Create `components/ui/UpgradePrompt.tsx`
    - Create as a bottom sheet modal (70% height, matching app style)
    - Include headline: "Unlock unlimited tracking"
    - List benefits: unlimited items, cloud sync, cross-device access
    - Primary CTA: "Sign in with Google" button (emerald accent)
    - Secondary action: "Maybe later" dismiss link
    - Use useAuth for sign-in action
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 6. Integrate limits into Jobs feature
  - [x] 6.1 Add LimitBanner to jobs dashboard (`app/(tabs)/index.tsx`)
    - Show banner below stats header for Free tier users
    - _Requirements: 1.3_

  - [x] 6.2 Update add-job modal to check limits
    - Use useLimits hook to check canCreate before showing form
    - Show UpgradePrompt if at limit
    - _Requirements: 1.2, 1.4_

- [x] 7. Integrate limits into Notes feature
  - [x] 7.1 Add LimitBanner to notes screen (`app/(tabs)/notes.tsx`)
    - Show banner at top for Free tier users
    - _Requirements: 2.3_

  - [x] 7.2 Update add-note modal to check limits
    - Use useLimits hook to check canCreate before showing form
    - Show UpgradePrompt if at limit
    - _Requirements: 2.2, 2.4_

- [x] 8. Integrate limits into Tasks feature
  - [x] 8.1 Add LimitBanner to tasks screen (`app/(tabs)/tasks.tsx`)
    - Show banner at top for Free tier users
    - _Requirements: 3.3_

  - [x] 8.2 Update add-task modal to check limits
    - Use useLimits hook to check canCreate before showing form
    - Show UpgradePrompt if at limit
    - _Requirements: 3.2, 3.4_

- [x] 9. Integrate limits into Habits feature
  - [x] 9.1 Add LimitBanner to habits screen (`app/(tabs)/habits.tsx`)
    - Show banner at top for Free tier users
    - _Requirements: 4.3_

  - [x] 9.2 Update add-habit modal to check limits
    - Use useLimits hook to check canCreate before showing form
    - Show UpgradePrompt if at limit
    - _Requirements: 4.2, 4.4_

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Write property test for limit status consistency (Property 6)
  - **Property 6: Limit Status Consistency**
  - **Validates: Requirements 1.2, 2.2, 3.2, 4.2, 7.2, 7.3**

- [x] 12. Final checkpoint
  - Verify all limit banners display correctly in Free tier
  - Verify upgrade prompts appear when at limit
  - Verify Premium tier users see no limits or banners
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks including property-based tests are required
- The implementation uses the existing useAuth hook for tier detection
- LimitBanner and UpgradePrompt follow the app's existing UI patterns (bottom sheets, emerald accent)
- No data migration between tiers - local and cloud data remain separate
