# Requirements Document

## Introduction

This feature enhances the job application tracking flow in the Mobile App by replacing manual text inputs with dropdown selectors where appropriate. The goal is to minimize typing, provide consistent data entry, and match the web app's functionality for platform selection, salary ranges with multiple currency options, and status-triggered workflows (offer details when status changes to "Offered" or "Accepted").

## Glossary

- **Job_Form**: The form component used for creating and editing job applications
- **Offer_Details_Form**: The form component for entering offer details (salary, benefits, accepted date)
- **Platform_Selector**: A dropdown component for selecting the job application platform
- **Currency_Selector**: A dropdown component for selecting salary currency
- **Salary_Range_Selector**: A dropdown component for selecting predefined salary ranges
- **Status_Workflow**: The logic that triggers additional forms based on job status changes

## Requirements

### Requirement 1: Platform Selection Dropdown

**User Story:** As a user, I want to select the job application platform from a dropdown list, so that I can quickly enter this information without typing.

#### Acceptance Criteria

1. WHEN a user opens the job form, THE Platform_Selector SHALL display predefined platform options: LinkedIn, Indeed, Glassdoor, Company Website, Referral, and Others
2. WHEN a user selects "Others" from the Platform_Selector, THE Job_Form SHALL display a text input field for entering a custom platform name
3. WHEN a user selects a predefined platform, THE Job_Form SHALL NOT display the custom platform input field
4. WHEN editing an existing job with a custom platform, THE Platform_Selector SHALL pre-select "Others" and populate the custom platform field

### Requirement 2: Salary Input with Currency and Range Selection

**User Story:** As a user, I want to select my salary currency and range from dropdowns, so that I can quickly enter offer details without manual formatting.

#### Acceptance Criteria

1. THE Currency_Selector SHALL provide options for USD, PKR, and GBP currencies with appropriate flag emojis
2. WHEN a currency is selected, THE Salary_Range_Selector SHALL display salary ranges appropriate for that currency
3. FOR USD currency, THE Salary_Range_Selector SHALL display ranges: $40,000–$80,000, $80,000–$120,000, $120,000–$160,000, $160,000–$250,000, $250,000+
4. FOR PKR currency, THE Salary_Range_Selector SHALL display ranges: ₨40,000–₨80,000, ₨80,000–₨120,000, ₨120,000–₨160,000, ₨160,000–₨250,000, ₨250,000+
5. FOR GBP currency, THE Salary_Range_Selector SHALL display ranges: £30,000–£50,000, £50,000–£70,000, £70,000–£90,000, £90,000–£120,000, £120,000+
6. WHEN a user selects both currency and salary range, THE Offer_Details_Form SHALL format and store the salary string with the appropriate currency symbol

### Requirement 3: Status Change Workflow for Offered Status

**User Story:** As a user, I want to be prompted for offer details when I change a job status to "Offered", so that I can capture important offer information at the right time.

#### Acceptance Criteria

1. WHEN a user changes job status to OFFERED, THE System SHALL navigate to the offer details modal
2. WHEN the offer details modal opens for OFFERED status, THE Offer_Details_Form SHALL pre-populate job title and company from the job being updated
3. WHEN a user completes the offer details form, THE System SHALL update the job with both the new status and offer details
4. WHEN a user cancels the offer details form, THE System SHALL NOT change the job status

### Requirement 4: Status Change Workflow for Accepted Status

**User Story:** As a user, I want to be prompted for offer details when I accept a job, and be warned if I already have an accepted job, so that I can manage my job offers properly.

#### Acceptance Criteria

1. WHEN a user changes job status to ACCEPTED and no other job is currently accepted, THE System SHALL navigate to the offer details modal
2. WHEN a user changes job status to ACCEPTED and another job is already accepted, THE System SHALL navigate to the accepted confirmation modal
3. WHEN the user confirms replacement in the accepted confirmation modal, THE System SHALL change the existing accepted job to OFFERED status
4. WHEN the user confirms replacement, THE System SHALL navigate to the offer details modal for the new job
5. WHEN the user cancels in the accepted confirmation modal, THE System SHALL NOT change any job status

### Requirement 5: Enhanced Offer Details Form

**User Story:** As a user, I want the offer details form to have dropdown selectors for salary, so that I can quickly enter offer information.

#### Acceptance Criteria

1. THE Offer_Details_Form SHALL display job title and company as editable fields pre-populated from the job
2. THE Offer_Details_Form SHALL include Currency_Selector and Salary_Range_Selector for salary input
3. THE Offer_Details_Form SHALL include a text area for benefits and perks
4. THE Offer_Details_Form SHALL include a date picker for the accepted date
5. WHEN editing existing offer details, THE Offer_Details_Form SHALL attempt to parse and pre-select the currency from the stored salary string

### Requirement 6: Reusable Dropdown Selector Component

**User Story:** As a developer, I want a reusable dropdown selector component, so that I can maintain consistent UI across all dropdown inputs.

#### Acceptance Criteria

1. THE Dropdown_Selector component SHALL accept a list of options with value and label properties
2. THE Dropdown_Selector component SHALL display the currently selected option
3. WHEN a user taps the Dropdown_Selector, THE component SHALL display all available options
4. WHEN a user selects an option, THE Dropdown_Selector SHALL close and update the selected value
5. THE Dropdown_Selector component SHALL support optional placeholder text when no value is selected
6. THE Dropdown_Selector component SHALL apply consistent styling from the theme system
