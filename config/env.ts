/**
 * Environment Configuration
 * 
 * Centralizes all environment variables and provides type-safe access.
 * Uses EXPO_PUBLIC_ prefix for client-side environment variables.
 */

// Environment types
export type AppEnvironment = 'development' | 'preview' | 'production';

// Determine current environment
const getEnvironment = (): AppEnvironment => {
  const env = process.env.EXPO_PUBLIC_APP_ENV || process.env.APP_ENV;
  
  if (env === 'production') return 'production';
  if (env === 'preview') return 'preview';
  return 'development';
};

// Environment-specific API URLs
const API_URLS: Record<AppEnvironment, string> = {
  development: 'http://localhost:3000/api',
  preview: 'https://preview.trackwithturtle.com/api',
  production: 'https://trackwithturtle.com/api',
};

// Current environment
export const APP_ENV = getEnvironment();

// Configuration object
export const config = {
  // Environment
  env: APP_ENV,
  isDevelopment: APP_ENV === 'development',
  isPreview: APP_ENV === 'preview',
  isProduction: APP_ENV === 'production',

  // API Configuration
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || API_URLS[APP_ENV],
    timeout: 30000,
  },

  // OAuth Configuration
  oauth: {
    google: {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    },
    github: {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || '',
    },
  },

  // NextAuth Configuration
  nextAuth: {
    secret: process.env.EXPO_PUBLIC_NEXTAUTH_SECRET || '',
  },

  // App Configuration
  app: {
    name: 'Turtle',
    version: '1.0.0',
    scheme: 'turtle',
  },

  // Feature Flags
  features: {
    enablePushNotifications: APP_ENV === 'production',
    enableAnalytics: APP_ENV === 'production',
    enableCrashReporting: APP_ENV !== 'development',
    enableDebugMode: APP_ENV === 'development',
    enableOfflineMode: true, // Allow offline usage with local storage
  },

  // Cache Configuration
  cache: {
    staleTime: APP_ENV === 'development' ? 0 : 5 * 60 * 1000, // 5 minutes in prod
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
} as const;

// Type for the config object
export type Config = typeof config;

export default config;
