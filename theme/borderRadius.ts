/**
 * Border Radius Configuration
 * 
 * Centralized border radius definitions matching the JobAppTracker web application.
 * Provides consistent rounded corners for UI components.
 * 
 * Requirements:
 * - 4.1: Use rounded corners (border-radius) consistent with the Web_App
 *        (1rem/16px for cards, 0.75rem/12px for buttons)
 */

/**
 * Border radius scale
 * Matches the web app's design tokens
 * 
 * Web app CSS variables:
 * --radius-sm: 0.375rem (6px)
 * --radius-md: 0.5rem (8px)
 * --radius-lg: 0.75rem (12px)
 * --radius-xl: 1rem (16px)
 * --radius-2xl: 1.5rem (24px)
 */
export const borderRadius = {
  /** No radius - 0px */
  none: 0,
  /** Small - 6px (0.375rem) - badges, small elements */
  sm: 6,
  /** Medium - 8px (0.5rem) - inputs, small buttons */
  md: 8,
  /** Large - 12px (0.75rem) - buttons, medium elements */
  lg: 12,
  /** Extra large - 16px (1rem) - cards, modals */
  xl: 16,
  /** 2x large - 24px (1.5rem) - large containers */
  '2xl': 24,
  /** Full - 9999px - pills, circular elements */
  full: 9999,
} as const;

/**
 * Component-specific border radius presets
 * Maps components to their appropriate border radius values
 */
export const componentBorderRadius = {
  /** Card border radius - 16px */
  card: borderRadius.xl,
  /** Button border radius - 12px */
  button: borderRadius.lg,
  /** Input border radius - 8px */
  input: borderRadius.md,
  /** Badge border radius - 6px */
  badge: borderRadius.sm,
  /** Modal border radius - 16px */
  modal: borderRadius.xl,
  /** Tooltip border radius - 8px */
  tooltip: borderRadius.md,
  /** Avatar border radius - full circle */
  avatar: borderRadius.full,
  /** Pill/tag border radius - full */
  pill: borderRadius.full,
  /** Dropdown border radius - 12px */
  dropdown: borderRadius.lg,
  /** Toast border radius - 12px */
  toast: borderRadius.lg,
} as const;

/**
 * Get border radius value by key
 */
export function getBorderRadius(key: keyof typeof borderRadius): number {
  return borderRadius[key];
}

/**
 * Get component border radius by component name
 */
export function getComponentBorderRadius(component: keyof typeof componentBorderRadius): number {
  return componentBorderRadius[component];
}

export type BorderRadiusKey = keyof typeof borderRadius;
export type ComponentBorderRadiusKey = keyof typeof componentBorderRadius;
