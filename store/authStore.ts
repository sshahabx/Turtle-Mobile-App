/**
 * Authentication Store
 *
 * Manages authentication state for the application using Zustand.
 * Handles user information, authentication status, and loading states.
 *
 * Requirements:
 * - 1.1: Display sign-in screen when no active session
 * - 1.5: Auto-authenticate with valid stored token
 */

import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check for stored token
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
    }),

  setAuthenticated: (authenticated) =>
    set({
      isAuthenticated: authenticated,
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  reset: () =>
    set({
      ...initialState,
      isLoading: false, // After reset, we're not loading anymore
    }),
}));
