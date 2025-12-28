# Design Document: UI Consistency with Web App

## Overview

This design document outlines the technical approach for updating the Turtle mobile app's UI to achieve visual consistency with the JobAppTracker web application. The implementation focuses on four key areas: font integration (Outfit), splash screen branding, color system alignment, and component styling consistency.

## Architecture

The UI consistency update follows a layered approach:

```
┌─────────────────────────────────────────────────────────────┐
│                    App Configuration                         │
│                    (app.json - Turtle branding)             │
├─────────────────────────────────────────────────────────────┤
│                    Theme System                              │
│         (colors.ts, typography.ts, spacing.ts)              │
├─────────────────────────────────────────────────────────────┤
│                    Font Provider                             │
│              (Outfit font loading via expo-font)            │
├─────────────────────────────────────────────────────────────┤
│                    UI Components                             │
│        (Button, Card, Input, Badge, etc.)                   │
├─────────────────────────────────────────────────────────────┤
│                    Screens                                   │
│     (Splash, Dashboard, Jobs, Tasks, Notes, Habits)         │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Theme Configuration

Create a centralized theme system that mirrors the web app's design tokens:

```typescript
// theme/colors.ts
export const colors = {
  // Light mode
  light: {
    background: '#ffffff',
    backgroundSecondary: '#f9fafb',
    backgroundTertiary: '#f3f4f6',
    text: '#111827',          // zinc-900
    textSecondary: '#4b5563', // zinc-600
    textMuted: '#6b7280',     // zinc-500
    border: '#e5e7eb',        // zinc-200
    borderSecondary: '#d1d5db', // zinc-300
  },
  // Dark mode
  dark: {
    background: '#030712',    // zinc-950
    backgroundSecondary: '#111827', // zinc-900
    backgroundTertiary: '#1f2937', // zinc-800
    text: '#f4f4f5',          // zinc-100
    textSecondary: '#a1a1aa', // zinc-400
    textMuted: '#71717a',     // zinc-500
    border: '#27272a',        // zinc-800
    borderSecondary: '#3f3f46', // zinc-700
  },
  // Status colors (consistent across themes)
  status: {
    applied: '#3b82f6',       // blue-500
    interviewing: '#f59e0b',  // amber-500
    offered: '#10b981',       // emerald-500
    rejected: '#ef4444',      // red-500
    accepted: '#22c55e',      // green-500
  },
};

// theme/typography.ts
export const typography = {
  fontFamily: {
    primary: 'Outfit',
    fallback: 'System',
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },
};

// theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
};

// theme/borderRadius.ts
export const borderRadius = {
  sm: 6,   // 0.375rem
  md: 8,   // 0.5rem
  lg: 12,  // 0.75rem - buttons
  xl: 16,  // 1rem - cards
  '2xl': 24, // 1.5rem
  full: 9999,
};
```

### 2. Font Loading System

```typescript
// hooks/useFonts.ts
import * as Font from 'expo-font';

export const fontAssets = {
  'Outfit-Light': require('../assets/fonts/Outfit-Light.ttf'),
  'Outfit-Regular': require('../assets/fonts/Outfit-Regular.ttf'),
  'Outfit-Medium': require('../assets/fonts/Outfit-Medium.ttf'),
  'Outfit-SemiBold': require('../assets/fonts/Outfit-SemiBold.ttf'),
  'Outfit-Bold': require('../assets/fonts/Outfit-Bold.ttf'),
  'Outfit-ExtraBold': require('../assets/fonts/Outfit-ExtraBold.ttf'),
};

export const useFonts = () => {
  return Font.useFonts(fontAssets);
};
```

### 3. Splash Screen Component

```typescript
// components/SplashScreen.tsx
interface SplashScreenProps {
  onFinish: () => void;
}

// Logo size: 64px (reduced from 100px)
// App name: "Turtle" displayed below logo
// Font: Outfit-Bold, 32px
// Background: #ffffff (light) / #111827 (dark)
```

### 4. Updated UI Components

All UI components will be updated to use the centralized theme:

- **Button**: borderRadius: 12, fontFamily: Outfit-SemiBold
- **Card**: borderRadius: 16, border: 1px solid border color, subtle shadow
- **Input**: borderRadius: 8, border: 1px solid border color, padding: 12
- **Badge**: borderRadius: 6, fontFamily: Outfit-Medium

## Data Models

No new data models are required. This update focuses on styling and configuration.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Font Configuration Consistency

*For any* text element in the Mobile_App, the font family should be set to "Outfit" with a valid fallback to the system font.

**Validates: Requirements 1.1, 1.2, 1.4**

### Property 2: Color Palette Consistency

*For any* color value used in the Mobile_App theme, it should match the corresponding zinc-based color from the Web_App's design system.

**Validates: Requirements 3.1, 3.5**

### Property 3: Component Border Radius Consistency

*For any* UI component (Card, Button, Input, Badge), the border-radius value should match the Web_App's design tokens (16px for cards, 12px for buttons, 8px for inputs, 6px for badges).

**Validates: Requirements 4.1**

### Property 4: Typography Scale Consistency

*For any* text style in the typography configuration, the font-weight for headings should be 600-700 and for body text should be 400, with line-height values of 1.25 for headings and 1.5 for body.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 5: WCAG Contrast Compliance

*For any* text/background color combination in the theme, the contrast ratio should meet WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 5.4**

## Error Handling

### Font Loading Failures

- If Outfit fonts fail to load, the app will use the system default sans-serif font
- The app will display a loading indicator while fonts are being loaded
- Font loading errors will be logged but will not crash the app

### Theme Errors

- Invalid color values will fall back to default colors
- Missing theme values will use sensible defaults

## Testing Strategy

### Unit Tests

Unit tests will verify specific configuration values and edge cases:

1. Verify app.json contains correct "Turtle" branding
2. Verify splash screen configuration for iOS and Android
3. Verify specific color hex values for light and dark modes
4. Verify font asset paths are correct

### Property-Based Tests

Property-based tests will use fast-check to verify universal properties:

1. **Font Configuration Property Test**: Generate random text elements and verify font family is "Outfit"
2. **Color Palette Property Test**: Generate color keys and verify values match web app
3. **Border Radius Property Test**: Generate component types and verify correct border-radius
4. **Typography Property Test**: Generate text style types and verify correct weights/line-heights
5. **Contrast Ratio Property Test**: Generate color pairs and verify WCAG AA compliance

### Test Configuration

- Property-based tests will run minimum 100 iterations
- Tests will use fast-check library for React Native
- Each test will be tagged with the property it validates
