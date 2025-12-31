/**
 * Platform Utility Functions
 * 
 * Provides utility functions for platform detection and selection
 * in the job form dropdown.
 * 
 * Requirements:
 * - 1.4: When editing an existing job with a custom platform, 
 *        the Platform_Selector SHALL pre-select "Others" and 
 *        populate the custom platform field
 */

/**
 * Predefined platform options available in the dropdown
 */
export const PREDEFINED_PLATFORMS = [
  'LinkedIn',
  'Indeed',
  'Glassdoor',
  'Company Website',
  'Referral',
] as const;

/**
 * Type for predefined platform values
 */
export type PredefinedPlatform = typeof PREDEFINED_PLATFORMS[number];

/**
 * Platform dropdown option interface
 */
export interface PlatformOption {
  value: string;
  label: string;
}

/**
 * All platform options including "Others" for custom platforms
 */
export const PLATFORM_OPTIONS: PlatformOption[] = [
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Indeed', label: 'Indeed' },
  { value: 'Glassdoor', label: 'Glassdoor' },
  { value: 'Company Website', label: 'Company Website' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Others', label: 'Others' },
];

/**
 * Platform selection result interface
 */
export interface PlatformSelection {
  selected: string;
  custom: string;
}

/**
 * Checks if a platform value is one of the predefined platforms
 * 
 * @param platform - The platform string to check
 * @returns true if the platform is predefined, false otherwise
 * 
 * Property 2: Custom Platform Initialization
 * - For any job with a platform value not in the predefined list,
 *   this function returns false, indicating it's a custom platform
 */
export function isPredefinedPlatform(platform: string): boolean {
  if (!platform || platform.trim() === '') {
    return false;
  }
  
  return PREDEFINED_PLATFORMS.includes(platform as PredefinedPlatform);
}

/**
 * Gets the platform selection state for a given platform value
 * 
 * This function determines whether to show a predefined platform
 * or "Others" with a custom value based on the input platform.
 * 
 * @param platform - The platform string from the job data
 * @returns Object with selected dropdown value and custom platform text
 * 
 * Property 2: Custom Platform Initialization
 * - For any job with a platform value not in the predefined list,
 *   when editing that job, the Platform_Selector SHALL be set to "Others"
 *   and the custom platform field SHALL contain the original platform value
 * 
 * Requirements: 1.4
 */
export function getPlatformSelection(platform: string): PlatformSelection {
  // Handle empty or undefined platform
  if (!platform || platform.trim() === '') {
    return {
      selected: '',
      custom: '',
    };
  }
  
  // Check if it's a predefined platform
  if (isPredefinedPlatform(platform)) {
    return {
      selected: platform,
      custom: '',
    };
  }
  
  // It's a custom platform - select "Others" and populate custom field
  return {
    selected: 'Others',
    custom: platform,
  };
}

/**
 * Gets the final platform value to save based on selection state
 * 
 * @param selected - The selected dropdown value
 * @param custom - The custom platform text (when "Others" is selected)
 * @returns The platform value to save to the job
 */
export function getFinalPlatformValue(selected: string, custom: string): string {
  if (selected === 'Others') {
    return custom.trim();
  }
  return selected;
}
