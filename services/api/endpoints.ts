/**
 * API Endpoint Constants
 * 
 * Centralized definition of all API endpoint URLs.
 * Requirements: 17.1, 17.2
 */

// ============================================================================
// Base Endpoints
// ============================================================================

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    SIGN_IN: '/auth/signin',
    SIGN_OUT: '/auth/signout',
    SESSION: '/auth/session',
    REFRESH: '/auth/refresh',
  },

  // Jobs
  JOBS: {
    BASE: '/jobs',
    BY_ID: (id: string) => `/jobs/${id}`,
  },

  // Notes
  NOTES: {
    BASE: '/notes',
    BY_ID: (id: string) => `/notes/${id}`,
  },

  // Tasks
  TASKS: {
    BASE: '/tasks',
    BY_ID: (id: string) => `/tasks/${id}`,
  },

  // Habits
  HABITS: {
    BASE: '/habits',
    BY_ID: (id: string) => `/habits/${id}`,
    COMPLETE: (id: string) => `/habits/${id}/complete`,
  },

  // User
  USER: {
    GOAL: '/user/goal',
    PROFILE: '/user/profile',
  },
} as const;

export default ENDPOINTS;
