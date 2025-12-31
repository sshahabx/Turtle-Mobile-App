# Design Document: Job Form Dropdowns

## Overview

This design enhances the Mobile App's job application tracking by replacing manual text inputs with dropdown selectors. The implementation follows the web app's patterns for platform selection, multi-currency salary ranges, and status-triggered workflows. The goal is to minimize typing while maintaining data consistency.

## Architecture

The feature follows the existing Mobile App architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      App Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  JobForm    │  │ OfferDetails│  │ AcceptedConfirm     │  │
│  │  (enhanced) │  │ Form        │  │ Modal               │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│  ┌──────┴────────────────┴─────────────────────┴──────────┐ │
│  │                  UI Components                          │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐    │ │
│  │  │ Dropdown   │  │ Currency   │  │ SalaryRange    │    │ │
│  │  │ Selector   │  │ Selector   │  │ Selector       │    │ │
│  │  └────────────┘  └────────────┘  └────────────────┘    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                              │                               │
│  ┌───────────────────────────┴───────────────────────────┐  │
│  │                    Hooks Layer                         │  │
│  │  useJobs (enhanced with status workflow logic)         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Dropdown Selector Component

A reusable dropdown component for consistent selection UI.

```typescript
interface DropdownOption {
  value: string;
  label: string;
  icon?: string; // Optional emoji or icon
}

interface DropdownSelectorProps {
  label?: string;
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}
```

### 2. Platform Selector

Wraps DropdownSelector with predefined platform options.

```typescript
const PLATFORM_OPTIONS: DropdownOption[] = [
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Indeed', label: 'Indeed' },
  { value: 'Glassdoor', label: 'Glassdoor' },
  { value: 'Company Website', label: 'Company Website' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Others', label: 'Others' },
];

interface PlatformSelectorProps {
  value: string;
  customPlatform: string;
  onPlatformChange: (platform: string) => void;
  onCustomPlatformChange: (custom: string) => void;
}
```

### 3. Currency and Salary Range Selectors

```typescript
type Currency = 'USD' | 'PKR' | 'GBP';

const CURRENCY_OPTIONS: DropdownOption[] = [
  { value: 'USD', label: 'USD', icon: '🇺🇸' },
  { value: 'PKR', label: 'PKR', icon: '🇵🇰' },
  { value: 'GBP', label: 'GBP', icon: '🇬🇧' },
];

const SALARY_RANGES: Record<Currency, DropdownOption[]> = {
  USD: [
    { value: '40k-80k', label: '$40,000 – $80,000' },
    { value: '80k-120k', label: '$80,000 – $120,000' },
    { value: '120k-160k', label: '$120,000 – $160,000' },
    { value: '160k-250k', label: '$160,000 – $250,000' },
    { value: '250k+', label: '$250,000+' },
  ],
  PKR: [
    { value: '40k-80k', label: '₨40,000 – ₨80,000' },
    { value: '80k-120k', label: '₨80,000 – ₨120,000' },
    { value: '120k-160k', label: '₨120,000 – ₨160,000' },
    { value: '160k-250k', label: '₨160,000 – ₨250,000' },
    { value: '250k+', label: '₨250,000+' },
  ],
  GBP: [
    { value: '30k-50k', label: '£30,000 – £50,000' },
    { value: '50k-70k', label: '£50,000 – £70,000' },
    { value: '70k-90k', label: '£70,000 – £90,000' },
    { value: '90k-120k', label: '£90,000 – £120,000' },
    { value: '120k+', label: '£120,000+' },
  ],
};

interface SalarySelectorProps {
  currency: Currency;
  salaryRange: string;
  onCurrencyChange: (currency: Currency) => void;
  onSalaryRangeChange: (range: string) => void;
}
```

### 4. Enhanced Job Form

The JobForm component will be updated to include:
- PlatformSelector instead of text input
- Status change detection for workflow triggers

### 5. Enhanced Offer Details Form

The OfferDetailsForm will be updated to include:
- Editable job title and company fields
- CurrencySelector and SalaryRangeSelector
- Currency parsing for existing salary strings

### 6. Status Workflow Logic

```typescript
interface StatusWorkflowResult {
  shouldNavigateToOfferDetails: boolean;
  shouldNavigateToAcceptedConfirm: boolean;
  existingAcceptedJobId?: string;
}

function determineStatusWorkflow(
  newStatus: JobStatus,
  currentStatus: JobStatus,
  jobs: Job[]
): StatusWorkflowResult;
```

## Data Models

### Salary Parsing Utility

```typescript
interface ParsedSalary {
  currency: Currency | null;
  range: string | null;
  rawValue: string;
}

function parseSalaryString(salary: string): ParsedSalary;
function formatSalary(currency: Currency, range: string): string;
```

### Platform Detection Utility

```typescript
const PREDEFINED_PLATFORMS = ['LinkedIn', 'Indeed', 'Glassdoor', 'Company Website', 'Referral'];

function isPredefinedPlatform(platform: string): boolean;
function getPlatformSelection(platform: string): { selected: string; custom: string };
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Custom Platform Input Visibility

*For any* platform selection, if "Others" is selected, the custom platform input field SHALL be visible; otherwise, it SHALL be hidden.

**Validates: Requirements 1.2, 1.3**

### Property 2: Custom Platform Initialization

*For any* job with a platform value not in the predefined list, when editing that job, the Platform_Selector SHALL be set to "Others" and the custom platform field SHALL contain the original platform value.

**Validates: Requirements 1.4**

### Property 3: Currency-Specific Salary Ranges

*For any* currency selection, the Salary_Range_Selector SHALL display only the salary ranges defined for that specific currency.

**Validates: Requirements 2.2**

### Property 4: Salary Formatting

*For any* combination of currency and salary range selection, the formatted salary string SHALL contain the correct currency symbol and range values.

**Validates: Requirements 2.6**

### Property 5: Offered Status Navigation

*For any* job status change to OFFERED, the system SHALL navigate to the offer details modal.

**Validates: Requirements 3.1**

### Property 6: Offer Form Pre-population

*For any* job being updated to OFFERED or ACCEPTED status, the offer details form SHALL be pre-populated with the job's title and company.

**Validates: Requirements 3.2, 5.1**

### Property 7: Offer Submission Persistence

*For any* completed offer details form submission, both the job status and offer details SHALL be persisted together.

**Validates: Requirements 3.3**

### Property 8: Cancellation State Preservation

*For any* cancellation of the offer details form or accepted confirmation modal, the original job status SHALL remain unchanged.

**Validates: Requirements 3.4, 4.5**

### Property 9: Accepted Status Conditional Navigation

*For any* job status change to ACCEPTED, if no other job is currently accepted, the system SHALL navigate directly to offer details; if another job is accepted, the system SHALL navigate to the confirmation modal.

**Validates: Requirements 4.1, 4.2**

### Property 10: Accepted Job Replacement

*For any* confirmed replacement in the accepted confirmation modal, the previously accepted job SHALL have its status changed to OFFERED.

**Validates: Requirements 4.3**

### Property 11: Salary Currency Parsing

*For any* existing salary string containing a recognized currency symbol ($, ₨, £), the offer details form SHALL pre-select the corresponding currency.

**Validates: Requirements 5.5**

### Property 12: Dropdown Selection Display

*For any* dropdown selector with a selected value, the component SHALL display the label of the selected option; when no value is selected, it SHALL display the placeholder text.

**Validates: Requirements 6.2, 6.5**

### Property 13: Dropdown Interaction Cycle

*For any* dropdown selector, tapping it SHALL display all options, and selecting an option SHALL close the dropdown and update the selected value.

**Validates: Requirements 6.3, 6.4**

## Error Handling

### Form Validation
- Required fields (title, company) must be validated before submission
- Custom platform field is required when "Others" is selected
- Salary selection is optional but if currency is selected, range should also be selected

### Navigation Errors
- If navigation to offer details fails, show error toast and preserve current state
- If job update fails, show error toast and allow retry

### Data Parsing Errors
- If salary string cannot be parsed, default to USD currency with no range selected
- If platform cannot be matched, default to "Others" with the value in custom field

## Testing Strategy

### Unit Tests
- Test DropdownSelector renders correctly with various option sets
- Test PlatformSelector shows/hides custom input based on selection
- Test SalarySelector displays correct ranges for each currency
- Test salary parsing utility with various input formats
- Test platform detection utility

### Property-Based Tests
- Use fast-check library for property-based testing
- Minimum 100 iterations per property test
- Each test tagged with: **Feature: job-form-dropdowns, Property N: [property text]**

### Integration Tests
- Test status change workflow triggers correct navigation
- Test offer details submission updates job correctly
- Test accepted job replacement flow end-to-end
