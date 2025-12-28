# Requirements Document

## Introduction

This specification defines the requirements for updating the Turtle mobile app's UI to achieve visual consistency with the JobAppTracker web application. The update includes adopting the Outfit font family, implementing matching color schemes, updating the splash screen with the "Turtle" branding and smaller logo, and ensuring consistent component styling across both platforms.

## Glossary

- **Mobile_App**: The React Native/Expo mobile application for job tracking
- **Web_App**: The JobAppTracker Next.js web application that serves as the design reference
- **Outfit_Font**: Google font family used as the primary typeface in the web application
- **Splash_Screen**: The initial loading screen displayed when the app launches
- **Theme_System**: The light/dark mode color system used throughout the application
- **Design_Token**: Reusable design values (colors, spacing, typography) that ensure consistency

## Requirements

### Requirement 1: Outfit Font Integration

**User Story:** As a user, I want the mobile app to use the same Outfit font as the web app, so that I have a consistent visual experience across platforms.

#### Acceptance Criteria

1. THE Mobile_App SHALL use Outfit as the primary font family for all text elements
2. THE Mobile_App SHALL support Outfit font weights: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold), and 800 (extrabold)
3. WHEN text is rendered, THE Mobile_App SHALL apply Outfit font consistently across all screens and components
4. IF the Outfit font fails to load, THEN THE Mobile_App SHALL fall back to the system default sans-serif font

### Requirement 2: Splash Screen Update

**User Story:** As a user, I want to see the "Turtle" brand name on the splash screen with a smaller logo, so that I immediately recognize the app identity.

#### Acceptance Criteria

1. THE Splash_Screen SHALL display the app name "Turtle" prominently
2. THE Splash_Screen SHALL display the logo at a reduced size (approximately 60-80px)
3. THE Splash_Screen SHALL use the Outfit font for the "Turtle" text
4. THE Splash_Screen SHALL support both light and dark mode backgrounds matching the web app's color scheme
5. WHEN the app launches, THE Splash_Screen SHALL display the Turtle branding before transitioning to the main app

### Requirement 3: Color Scheme Consistency

**User Story:** As a user, I want the mobile app colors to match the web app, so that I have a unified brand experience.

#### Acceptance Criteria

1. THE Mobile_App SHALL use the same zinc-based color palette as the Web_App for backgrounds and text
2. THE Mobile_App SHALL implement light mode with white (#ffffff) background and zinc-900 (#111827) text
3. THE Mobile_App SHALL implement dark mode with zinc-950 (#030712) background and zinc-100 (#f4f4f5) text
4. THE Mobile_App SHALL use consistent border colors: zinc-200 (#e5e7eb) for light mode and zinc-800 (#27272a) for dark mode
5. THE Mobile_App SHALL use the same status colors for job statuses (applied, interviewing, offered, rejected, accepted)

### Requirement 4: Component Styling Consistency

**User Story:** As a user, I want buttons, cards, and inputs to look similar to the web app, so that the mobile experience feels familiar.

#### Acceptance Criteria

1. THE Mobile_App SHALL use rounded corners (border-radius) consistent with the Web_App (1rem/16px for cards, 0.75rem/12px for buttons)
2. THE Mobile_App SHALL apply consistent padding and spacing using the Web_App's spacing scale
3. WHEN displaying cards, THE Mobile_App SHALL use subtle borders and shadows matching the Web_App design
4. THE Mobile_App SHALL style buttons with the same visual treatment as the Web_App (solid backgrounds, hover states)
5. THE Mobile_App SHALL style input fields with consistent borders, padding, and focus states

### Requirement 5: Typography Hierarchy

**User Story:** As a user, I want text sizes and weights to be consistent with the web app, so that content is easy to read and scan.

#### Acceptance Criteria

1. THE Mobile_App SHALL use a typography scale that matches the Web_App proportionally adjusted for mobile screens
2. THE Mobile_App SHALL apply font-weight 600-700 for headings and 400 for body text
3. THE Mobile_App SHALL use appropriate line-height values (1.5 for body, 1.25 for headings)
4. THE Mobile_App SHALL maintain consistent text color contrast ratios meeting WCAG AA standards

### Requirement 6: App Configuration Update

**User Story:** As a developer, I want the app configuration to reflect the "Turtle" branding, so that the app identity is consistent throughout.

#### Acceptance Criteria

1. THE Mobile_App configuration SHALL update the app name to "Turtle"
2. THE Mobile_App configuration SHALL update the slug to "turtle"
3. THE Mobile_App configuration SHALL update the scheme to "turtle"
4. THE Mobile_App configuration SHALL maintain proper splash screen configuration for both iOS and Android
