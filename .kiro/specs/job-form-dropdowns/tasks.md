# Implementation Plan: Job Form Dropdowns

## Overview

This plan implements dropdown selectors for the Mobile App's job form, including platform selection, multi-currency salary ranges, and status-triggered workflows. Tasks are ordered to build foundational components first, then integrate them into existing forms.

## Tasks

- [-] 1. Create reusable DropdownSelector component
  - [x] 1.1 Create DropdownSelector component with options, value, onChange props
    - Create `Mobile-App/components/ui/DropdownSelector.tsx`
    - Implement TouchableOpacity trigger showing selected value or placeholder
    - Implement options list with proper styling from theme
    - Handle open/close state and option selection
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 1.2 Write property test for dropdown selection display
    - **Property 12: Dropdown Selection Display**
    - **Validates: Requirements 6.2, 6.5**

  - [ ]* 1.3 Write property test for dropdown interaction cycle
    - **Property 13: Dropdown Interaction Cycle**
    - **Validates: Requirements 6.3, 6.4**

- [x] 2. Create platform and salary selector utilities
  - [x] 2.1 Create platform detection utility functions
    - Create `Mobile-App/features/jobs/utils/platformUtils.ts`
    - Implement `isPredefinedPlatform()` function
    - Implement `getPlatformSelection()` function
    - Define PREDEFINED_PLATFORMS constant
    - _Requirements: 1.4_

  - [x] 2.2 Create salary parsing and formatting utilities
    - Create `Mobile-App/features/jobs/utils/salaryUtils.ts`
    - Implement `parseSalaryString()` function
    - Implement `formatSalary()` function
    - Define CURRENCY_OPTIONS and SALARY_RANGES constants
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 2.3 Write property test for salary formatting
    - **Property 4: Salary Formatting**
    - **Validates: Requirements 2.6**

  - [ ]* 2.4 Write property test for salary currency parsing
    - **Property 11: Salary Currency Parsing**
    - **Validates: Requirements 5.5**

  - [ ]* 2.5 Write property test for custom platform initialization
    - **Property 2: Custom Platform Initialization**
    - **Validates: Requirements 1.4**

- [ ] 3. Checkpoint - Ensure all utility tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create PlatformSelector component
  - [x] 4.1 Create PlatformSelector component
    - Create `Mobile-App/components/jobs/PlatformSelector.tsx`
    - Use DropdownSelector with PLATFORM_OPTIONS
    - Conditionally render custom platform Input when "Others" selected
    - Handle both platform and custom platform state
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 4.2 Write property test for custom platform input visibility
    - **Property 1: Custom Platform Input Visibility**
    - **Validates: Requirements 1.2, 1.3**

- [x] 5. Create SalarySelector component
  - [x] 5.1 Create SalarySelector component
    - Create `Mobile-App/components/jobs/SalarySelector.tsx`
    - Include CurrencySelector dropdown with flag emojis
    - Include SalaryRangeSelector that updates based on currency
    - Handle currency and range state
    - _Requirements: 2.1, 2.2_

  - [ ]* 5.2 Write property test for currency-specific salary ranges
    - **Property 3: Currency-Specific Salary Ranges**
    - **Validates: Requirements 2.2**

- [x] 6. Update JobForm with PlatformSelector
  - [x] 6.1 Replace platform text input with PlatformSelector
    - Update `Mobile-App/components/jobs/JobForm.tsx`
    - Add customPlatform state
    - Update form submission to use correct platform value
    - Handle initialization for existing jobs with custom platforms
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 7. Checkpoint - Ensure JobForm works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Update OfferDetailsForm with SalarySelector
  - [x] 8.1 Add job title and company editable fields
    - Update `Mobile-App/components/jobs/OfferDetailsForm.tsx`
    - Add offerTitle and offerCompany Input fields
    - Pre-populate from props
    - _Requirements: 5.1_

  - [x] 8.2 Replace salary text input with SalarySelector
    - Add currency and salaryRange state
    - Use parseSalaryString for initialization
    - Use formatSalary for submission
    - _Requirements: 5.2, 5.5_

  - [ ]* 8.3 Write property test for offer form pre-population
    - **Property 6: Offer Form Pre-population**
    - **Validates: Requirements 3.2, 5.1**

- [-] 9. Implement status change workflow logic
  - [x] 9.1 Create status workflow utility
    - Create `Mobile-App/features/jobs/utils/statusWorkflow.ts`
    - Implement `determineStatusWorkflow()` function
    - Check for existing accepted jobs
    - Return navigation instructions
    - _Requirements: 3.1, 4.1, 4.2_

  - [ ]* 9.2 Write property test for offered status navigation
    - **Property 5: Offered Status Navigation**
    - **Validates: Requirements 3.1**

  - [ ]* 9.3 Write property test for accepted status conditional navigation
    - **Property 9: Accepted Status Conditional Navigation**
    - **Validates: Requirements 4.1, 4.2**

- [x] 10. Update edit-job modal with status workflow
  - [x] 10.1 Integrate status workflow in edit-job modal
    - Update `Mobile-App/app/modals/edit-job.tsx`
    - Detect status changes to OFFERED or ACCEPTED
    - Navigate to appropriate modal based on workflow result
    - Pass job data to offer details modal
    - _Requirements: 3.1, 4.1, 4.2_

  - [ ]* 10.2 Write property test for cancellation state preservation
    - **Property 8: Cancellation State Preservation**
    - **Validates: Requirements 3.4, 4.5**

- [x] 11. Update offer-details modal
  - [x] 11.1 Update offer-details modal to receive job data
    - Update `Mobile-App/app/modals/offer-details.tsx`
    - Accept jobTitle and companyName params
    - Pass to OfferDetailsForm
    - _Requirements: 3.2_

  - [ ]* 11.2 Write property test for offer submission persistence
    - **Property 7: Offer Submission Persistence**
    - **Validates: Requirements 3.3**

- [x] 12. Update accepted-confirm modal with replacement logic
  - [x] 12.1 Implement job replacement in accepted-confirm modal
    - Update `Mobile-App/app/modals/accepted-confirm.tsx`
    - On confirm, update existing job to OFFERED status
    - Navigate to offer-details-replace modal
    - _Requirements: 4.3, 4.4_

  - [ ]* 12.2 Write property test for accepted job replacement
    - **Property 10: Accepted Job Replacement**
    - **Validates: Requirements 4.3**

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
