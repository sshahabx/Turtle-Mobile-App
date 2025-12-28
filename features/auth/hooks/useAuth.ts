/**
 * useAuth Hook
 * 
 * Provides authentication state and methods for OAuth sign-in.
 * Supports Google and GitHub OAuth providers.
 * Falls back to offline mode if authentication fails.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  signInWithGoogle,
  signInWithGitHub,
  signOut as authSignOut,
  isAuthenticated as checkAuth,
  getStoredUser,
  validateToken,
  User,
  AuthResult,
  OAuthProvider,
} from '../services/authService';
import * as db from '../../../services/database';

export interface UseAuthReturn {
  /** Current user (null if not authenticated) */
  user: User | null;
  /** Whether authentication is being checked */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether app is in offline mode (no auth) */
  isOfflineMode: boolean;
  /** Sign in with Google */
  signInWithGoogle: () => Promise<AuthResult>;
  /** Sign in with GitHub */
  signInWithGitHub: () => Promise<AuthResult>;
  /** Sign out */
  signOut: () => Promise<void>;
  /** Continue without signing in (offline mode) */
  continueOffline: () => Promise<void>;
  /** Refresh authentication state */
  refreshAuth: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // First check if user has completed onboarding (offline mode)
        const onboarded = await db.isOnboarded();
        
        // Then check for OAuth authentication
        const authenticated = await checkAuth();
        
        if (authenticated) {
          // Validate token and get user
          const validUser = await validateToken();
          if (validUser) {
            setUser(validUser);
            setIsAuthenticated(true);
            setIsOfflineMode(false);
          } else {
            // Token invalid, check offline mode
            setIsAuthenticated(false);
            setIsOfflineMode(onboarded);
          }
        } else {
          // Not authenticated via OAuth
          setIsAuthenticated(false);
          setIsOfflineMode(onboarded);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Fall back to offline mode check
        const onboarded = await db.isOnboarded();
        setIsOfflineMode(onboarded);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Sign in with Google
  const handleGoogleSignIn = useCallback(async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        setIsOfflineMode(false);
        await db.setOnboarded(true);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign in with GitHub
  const handleGitHubSignIn = useCallback(async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const result = await signInWithGitHub();
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        setIsOfflineMode(false);
        await db.setOnboarded(true);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign out
  const handleSignOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authSignOut();
      setUser(null);
      setIsAuthenticated(false);
      // Keep offline mode status - user can still use app offline
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Continue without signing in (offline mode)
  const continueOffline = useCallback(async (): Promise<void> => {
    await db.setOnboarded(true);
    setIsOfflineMode(true);
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  // Refresh authentication state
  const refreshAuth = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const authenticated = await checkAuth();
      if (authenticated) {
        const validUser = await validateToken();
        if (validUser) {
          setUser(validUser);
          setIsAuthenticated(true);
          setIsOfflineMode(false);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    isOfflineMode,
    signInWithGoogle: handleGoogleSignIn,
    signInWithGitHub: handleGitHubSignIn,
    signOut: handleSignOut,
    continueOffline,
    refreshAuth,
  };
};

export default useAuth;
