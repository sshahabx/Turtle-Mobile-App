/**
 * Spacing Configuration
 * 
 * Centralized spacing definitions matching the JobAppTracker web application.
 * Provides consistent spacing scale for margins, padding, and gaps.
 * 
 * Requirements:
 * - 4.2: Apply consistent padding and spacing using the Web_App's spacing scale
 */

/**
 * Base spacing unit in pixels
 * All spacing values are multiples of this base
 */
export const SPACING_BASE = 4;

/**
 * Spacing scale
 * Matches Tailwind CSS spacing scale used in the web app
 */
export const spacing = {
  /** 0px */
  none: 0,
  /** 2px - Extra extra small */
  xxs: 2,
  /** 4px - Extra small */
  xs: 4,
  /** 8px - Small */
  sm: 8,
  /** 12px - Medium */
  md: 12,
  /** 16px - Large */
  lg: 16,
  /** 20px - Extra large */
  xl: 20,
  /** 24px - 2x large */
  '2xl': 24,
  /** 32px - 3x large */
  '3xl': 32,
  /** 48px - 4x large */
  '4xl': 48,
  /** 64px - 5x large */
  '5xl': 64,
  /** 96px - 6x large */
  '6xl': 96,
} as const;

/**
 * Numeric spacing scale (for programmatic access)
 * Maps to Tailwind's numeric spacing values
 */
export const spacingNumeric = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

/**
 * Component-specific spacing presets
 * Common spacing patterns used throughout the app
 */
export const componentSpacing = {
  /** Card internal padding */
  cardPadding: spacing.lg,
  /** Card gap between elements */
  cardGap: spacing.md,
  
  /** Button horizontal padding */
  buttonPaddingX: spacing.lg,
  /** Button vertical padding */
  buttonPaddingY: spacing.md,
  
  /** Input horizontal padding */
  inputPaddingX: spacing.md,
  /** Input vertical padding */
  inputPaddingY: spacing.md,
  
  /** Screen horizontal padding */
  screenPaddingX: spacing.lg,
  /** Screen vertical padding */
  screenPaddingY: spacing.lg,
  
  /** Section gap */
  sectionGap: spacing['2xl'],
  
  /** List item gap */
  listItemGap: spacing.md,
  
  /** Icon spacing from text */
  iconGap: spacing.sm,
} as const;

/**
 * Layout spacing presets
 * For consistent page and section layouts
 */
export const layoutSpacing = {
  /** Page horizontal margin */
  pageMarginX: spacing.lg,
  /** Page vertical margin */
  pageMarginY: spacing.lg,
  
  /** Section vertical spacing */
  sectionSpacingY: spacing['3xl'],
  
  /** Header height */
  headerHeight: 56,
  /** Tab bar height */
  tabBarHeight: 64,
  
  /** Safe area padding (additional to system safe area) */
  safeAreaPadding: spacing.lg,
} as const;

/**
 * Get spacing value by key or number
 */
export function getSpacing(key: keyof typeof spacing | number): number {
  if (typeof key === 'number') {
    return key * SPACING_BASE;
  }
  return spacing[key];
}

export type SpacingKey = keyof typeof spacing;
export type SpacingNumericKey = keyof typeof spacingNumeric;
