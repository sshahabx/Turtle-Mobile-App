/**
 * Theme System
 * 
 * Centralized theme configuration for the Turtle mobile app.
 * Provides consistent design tokens matching the JobAppTracker web application.
 * 
 * Usage:
 * ```tsx
 * import { colors, typography, spacing, borderRadius } from '../theme';
 * 
 * // Access light/dark colors
 * const bgColor = colors.lightColors.background;
 * 
 * // Access typography
 * const headingStyle = typography.textStyles.h1;
 * 
 * // Access spacing
 * const padding = spacing.lg;
 * 
 * // Access border radius
 * const cardRadius = borderRadius.xl;
 * ```
 */

// Colors
export {
  zinc,
  emerald,
  lightColors,
  darkColors,
  statusColors,
  semanticColors,
  getColorsForScheme,
  type ThemeColors,
  type ColorScheme,
  type StatusColorKey,
  type SemanticColorKey,
} from './colors';

// Typography
export {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  textStyles,
  typography,
  type FontFamily,
  type FontWeight,
  type FontSize,
  type LineHeight,
  type TextStyle,
} from './typography';

// Spacing
export {
  SPACING_BASE,
  spacing,
  spacingNumeric,
  componentSpacing,
  layoutSpacing,
  getSpacing,
  type SpacingKey,
  type SpacingNumericKey,
} from './spacing';

// Border Radius
export {
  borderRadius,
  componentBorderRadius,
  getBorderRadius,
  getComponentBorderRadius,
  type BorderRadiusKey,
  type ComponentBorderRadiusKey,
} from './borderRadius';

/**
 * Complete theme object
 * Combines all theme tokens for convenient access
 */
export const theme = {
  colors: {
    light: require('./colors').lightColors,
    dark: require('./colors').darkColors,
    status: require('./colors').statusColors,
    semantic: require('./colors').semanticColors,
    zinc: require('./colors').zinc,
  },
  typography: require('./typography').typography,
  spacing: require('./spacing').spacing,
  borderRadius: require('./borderRadius').borderRadius,
} as const;

export default theme;
