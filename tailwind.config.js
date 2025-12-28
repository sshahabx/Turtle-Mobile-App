/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./index.ts",
  ],
  darkMode: "class", // Enable class-based dark mode for NativeWind
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Extended gray palette for better dark mode support
        // All colors chosen for WCAG AA contrast compliance
        gray: {
          50: '#f9fafb',   // Light mode backgrounds
          100: '#f3f4f6',  // Light mode secondary backgrounds
          200: '#e5e7eb',  // Light mode borders
          300: '#d1d5db',  // Light mode secondary borders, dark mode text
          400: '#9ca3af',  // Dark mode tertiary text (6.6:1 contrast)
          500: '#6b7280',  // Light mode tertiary text (5.0:1 contrast)
          600: '#4b5563',  // Light mode secondary text (7.0:1 contrast)
          700: '#374151',  // Dark mode borders
          800: '#1f2937',  // Dark mode surfaces/cards
          900: '#111827',  // Dark mode backgrounds
          950: '#030712',  // Deepest dark
        },
        // Success colors
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',  // Dark mode
          500: '#10b981',  // Light mode
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Warning colors
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',  // Dark mode
          500: '#f59e0b',  // Light mode
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Error colors
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',  // Dark mode
          500: '#ef4444',  // Light mode
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Info colors (same as primary)
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',  // Dark mode
          500: '#3b82f6',  // Light mode
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      // Background colors for semantic usage
      backgroundColor: {
        // Light mode
        'light': '#ffffff',
        'light-secondary': '#f9fafb',
        'light-tertiary': '#f3f4f6',
        // Dark mode
        'dark': '#111827',
        'dark-secondary': '#1f2937',
        'dark-tertiary': '#374151',
      },
      // Text colors with proper contrast ratios
      textColor: {
        // Light mode text (on light backgrounds)
        'light-primary': '#111827',    // 16.1:1 contrast
        'light-secondary': '#4b5563',  // 7.0:1 contrast
        'light-tertiary': '#6b7280',   // 5.0:1 contrast
        // Dark mode text (on dark backgrounds)
        'dark-primary': '#f9fafb',     // 15.8:1 contrast
        'dark-secondary': '#d1d5db',   // 10.9:1 contrast
        'dark-tertiary': '#9ca3af',    // 6.6:1 contrast
      },
      // Border colors
      borderColor: {
        'light': '#e5e7eb',
        'light-secondary': '#d1d5db',
        'dark': '#374151',
        'dark-secondary': '#4b5563',
      },
    },
  },
  plugins: [],
};
