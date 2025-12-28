# App Assets

This folder contains the app icons and splash screen images for the JobAppTracker mobile app.

## Required Assets

### App Icon (`icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG (no transparency for iOS App Store)
- **Usage**: Main app icon for iOS and Android

### Adaptive Icon (`adaptive-icon.png`)
- **Size**: 1024x1024 pixels (foreground layer)
- **Format**: PNG with transparency
- **Usage**: Android adaptive icon foreground layer
- **Note**: Design with safe zone in mind (center 66% is always visible)

### Splash Icon (`splash-icon.png`)
- **Size**: 1284x2778 pixels (or similar aspect ratio)
- **Format**: PNG
- **Usage**: Splash screen displayed during app launch

### Favicon (`favicon.png`)
- **Size**: 48x48 pixels
- **Format**: PNG
- **Usage**: Web browser favicon

## Color Scheme

- **Light Mode Background**: `#ffffff`
- **Dark Mode Background**: `#1a1a2e`

## Generating Icons

You can use tools like:
- [Expo Icon Builder](https://buildicon.netlify.app/)
- [App Icon Generator](https://appicon.co/)
- [Figma](https://figma.com) with export plugins

## Notes

- Ensure all icons follow platform guidelines
- iOS icons should not have transparency
- Android adaptive icons should have proper safe zones
- Test icons on both light and dark backgrounds
