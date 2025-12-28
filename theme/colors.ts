/**
 * Color Palette
 * 
 * Centralized color definitions matching the JobAppTracker web application.
 * Uses zinc-based color palette for backgrounds and text.
 * Primary color is emerald green to match the Turtle branding.
 * 
 * Requirements:
 * - 3.1: Use the same zinc-based color palette as the Web_App
 * - 3.2: Implement light mode with white background and zinc-900 text
 * - 3.3: Implement dark mode with zinc-950 background and zinc-100 text
 * - 3.4: Use consistent border colors for light and dark modes
 * - 3.5: Use the same status colors for job statuses
 */

/**
 * Zinc color scale from Tailwind CSS
 * Used as the foundation for the color system
 */
export const zinc = {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b',
} as const;

/**
 * Emerald color scale - Primary brand color
 */
export const emerald = {
  50: '#ecfdf5',
  100: '#d1fae5',
  200: '#a7f3d0',
  300: '#6ee7b7',
  400: '#34d399',
  500: '#10b981',
  600: '#059669',
  700: '#047857',
  800: '#065f46',
  900: '#064e3b',
  950: '#022c22',
} as const;

/**
 * Light mode color palette
 * Matches the web app's light theme with emerald primary
 */
export const lightColors = {
  // Background colors
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',  // slate-50
  backgroundTertiary: '#f1f5f9',   // slate-100
  
  // Surface colors (cards, modals)
  surface: '#ffffff',
  surfaceSecondary: '#f8fafc',
  
  // Text colors - zinc-based for consistency with web app
  text: '#18181b',                 // zinc-900
  textSecondary: '#52525b',        // zinc-600
  textMuted: '#71717a',            // zinc-500
  textTertiary: '#71717a',         // zinc-500
  textInverse: '#ffffff',
  
  // Border colors
  border: '#e4e4e7',               // zinc-200
  borderSecondary: '#d4d4d8',      // zinc-300
  
  // Primary brand colors - Emerald green (Turtle theme)
  primary: '#10b981',              // emerald-500
  primaryLight: '#34d399',         // emerald-400
  primaryDark: '#059669',          // emerald-600
  
  // Status bar style
  statusBarStyle: 'dark' as const,
} as const;

/**
 * Dark mode color palette
 * Matches the web app's dark theme with emerald primary
 */
export const darkColors = {
  // Background colors
  background: '#09090b',           // zinc-950
  backgroundSecondary: '#18181b',  // zinc-900
  backgroundTertiary: '#27272a',   // zinc-800
  
  // Surface colors (cards, modals)
  surface: '#18181b',              // zinc-900
  surfaceSecondary: '#27272a',     // zinc-800
  
  // Text colors - zinc-based for consistency with web app
  text: '#f4f4f5',                 // zinc-100
  textSecondary: '#a1a1aa',        // zinc-400
  textMuted: '#71717a',            // zinc-500
  textTertiary: '#71717a',         // zinc-500
  textInverse: '#18181b',          // zinc-900
  
  // Border colors
  border: '#27272a',               // zinc-800
  borderSecondary: '#3f3f46',      // zinc-700
  
  // Primary brand colors - Emerald green (lighter for dark mode)
  primary: '#34d399',              // emerald-400
  primaryLight: '#6ee7b7',         // emerald-300
  primaryDark: '#10b981',          // emerald-500
  
  // Status bar style
  statusBarStyle: 'light' as const,
} as const;

/**
 * Status colors for job application statuses
 * Consistent across light and dark themes
 */
export const statusColors = {
  applied: '#3b82f6',              // blue-500
  interviewing: '#f59e0b',         // amber-500
  offered: '#10b981',              // emerald-500
  rejected: '#ef4444',             // red-500
  accepted: '#22c55e',             // green-500
  pending: '#6b7280',              // gray-500
} as const;

/**
 * Semantic status colors
 * Used for feedback and notifications
 */
export const semanticColors = {
  success: '#10b981',              // emerald-500
  successLight: '#34d399',         // emerald-400
  warning: '#f59e0b',              // amber-500
  warningLight: '#fbbf24',         // amber-400
  error: '#ef4444',                // red-500
  errorLight: '#f87171',           // red-400
  info: '#3b82f6',                 // blue-500
  infoLight: '#60a5fa',            // blue-400
} as const;

/**
 * Combined colors type for theme context
 */
export interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Surface colors
  surface: string;
  surfaceSecondary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  textTertiary: string;
  textInverse: string;
  
  // Border colors
  border: string;
  borderSecondary: string;
  
  // Primary brand colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Status bar style
  statusBarStyle: 'light' | 'dark';
}

/**
 * Get colors for a specific color scheme
 */
export function getColorsForScheme(scheme: 'light' | 'dark'): ThemeColors {
  return scheme === 'dark' ? darkColors : lightColors;
}

export type ColorScheme = 'light' | 'dark';
export type StatusColorKey = keyof typeof statusColors;
export type SemanticColorKey = keyof typeof semanticColors;
