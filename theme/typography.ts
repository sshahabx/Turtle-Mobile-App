/**
 * Typography Configuration
 * 
 * Centralized typography definitions matching the JobAppTracker web application.
 * Uses Outfit font family with consistent weights, sizes, and line heights.
 * 
 * Requirements:
 * - 5.1: Use a typography scale that matches the Web_App proportionally adjusted for mobile
 * - 5.2: Apply font-weight 600-700 for headings and 400 for body text
 * - 5.3: Use appropriate line-height values (1.5 for body, 1.25 for headings)
 */

/**
 * Font family configuration
 * Primary: Outfit (Google Font)
 * Fallback: System default sans-serif
 */
export const fontFamily = {
  /** Primary font family - Outfit */
  primary: 'Outfit',
  /** Fallback font family - System default */
  fallback: 'System',
  
  // Specific weight variants for React Native
  light: 'Outfit-Light',
  regular: 'Outfit-Regular',
  medium: 'Outfit-Medium',
  semibold: 'Outfit-SemiBold',
  bold: 'Outfit-Bold',
  extrabold: 'Outfit-ExtraBold',
} as const;

/**
 * Font weight values
 * Maps semantic names to numeric weights
 */
export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

/**
 * Font size scale
 * Proportionally adjusted for mobile screens
 * Based on web app's typography scale
 */
export const fontSize = {
  /** Extra small - 12px */
  xs: 12,
  /** Small - 14px */
  sm: 14,
  /** Base - 16px */
  base: 16,
  /** Large - 18px */
  lg: 18,
  /** Extra large - 20px */
  xl: 20,
  /** 2x large - 24px */
  '2xl': 24,
  /** 3x large - 30px */
  '3xl': 30,
  /** 4x large - 36px */
  '4xl': 36,
} as const;

/**
 * Line height values
 * Ensures consistent vertical rhythm
 */
export const lineHeight = {
  /** Tight - 1.25 (for headings) */
  tight: 1.25,
  /** Normal - 1.5 (for body text) */
  normal: 1.5,
  /** Relaxed - 1.625 (for comfortable reading) */
  relaxed: 1.625,
} as const;

/**
 * Letter spacing values
 * For fine-tuning text appearance
 */
export const letterSpacing = {
  /** Tighter - -0.025em */
  tighter: -0.4,
  /** Tight - -0.0125em */
  tight: -0.2,
  /** Normal - 0 */
  normal: 0,
  /** Wide - 0.025em */
  wide: 0.4,
  /** Wider - 0.05em */
  wider: 0.8,
} as const;

/**
 * Pre-defined text styles for common use cases
 * Combines font family, size, weight, and line height
 */
export const textStyles = {
  // Headings
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['4xl'],
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'],
    lineHeight: fontSize['3xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h4: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.tight,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.tight,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.tight,
    letterSpacing: letterSpacing.normal,
  },
  
  // Body text
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  
  // Caption and labels
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  
  // Button text
  button: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.tight,
    letterSpacing: letterSpacing.normal,
  },
  buttonSmall: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.tight,
    letterSpacing: letterSpacing.normal,
  },
} as const;

/**
 * Typography configuration object
 * Combines all typography-related values
 */
export const typography = {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  textStyles,
} as const;

export type FontFamily = keyof typeof fontFamily;
export type FontWeight = keyof typeof fontWeight;
export type FontSize = keyof typeof fontSize;
export type LineHeight = keyof typeof lineHeight;
export type TextStyle = keyof typeof textStyles;
