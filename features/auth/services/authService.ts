/**
 * Authentication Service
 *
 * Handles OAuth authentication using expo-auth-session.
 * Supports Google and GitHub OAuth providers.
 * Integrates with the web app's NextAuth backend.
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { config } from '../../../config';

// Complete any pending auth sessions
WebBrowser.maybeCompleteAuthSession();

// Storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

// Google iOS reversed client ID for URL scheme
const GOOGLE_IOS_REVERSED_CLIENT_ID = 'com.googleusercontent.apps.1037081207362-1u4s4t0s76e584c0u48gng8ldao9a88o';

// User interface
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

// Auth result interface
export interface AuthResult {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  error?: string;
}

// OAuth provider type
export type OAuthProvider = 'google' | 'github';

// GitHub OAuth configuration
const githubDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: 'https://github.com/settings/connections/applications/' + config.oauth.github.clientId,
};

/**
 * Get the redirect URI for OAuth (for GitHub)
 */
const getRedirectUri = (): string => {
  return AuthSession.makeRedirectUri({
    scheme: config.app.scheme,
    path: 'auth/callback',
  });
};

/**
 * Sign in with Google OAuth
 * Uses iOS client ID with reversed client ID scheme for iOS devices
 */
export const signInWithGoogle = async (): Promise<AuthResult> => {
  try {
    const iosClientId = config.oauth.google.iosClientId;
    const webClientId = config.oauth.google.clientId;
    
    // On iOS, use the iOS client ID with the reversed client ID as redirect URI
    const isIOS = Platform.OS === 'ios';
    const clientId = isIOS ? iosClientId : webClientId;
    
    // For iOS, use the reversed client ID scheme
    // For other platforms, use the app scheme
    const redirectUri = isIOS
      ? `${GOOGLE_IOS_REVERSED_CLIENT_ID}:/oauth2redirect/google`
      : AuthSession.makeRedirectUri({
          scheme: config.app.scheme,
          path: 'auth/callback',
        });
    
    console.log('Google OAuth config:', {
      platform: Platform.OS,
      clientId: clientId?.substring(0, 20) + '...',
      redirectUri,
    });

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    });

    const discovery: AuthSession.DiscoveryDocument = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    const result = await request.promptAsync(discovery);

    if (result.type === 'success' && result.params.code) {
      // Exchange code for tokens via our backend
      return await exchangeCodeForTokens('google', result.params.code, redirectUri, request.codeVerifier);
    }

    if (result.type === 'cancel') {
      return { success: false, error: 'Sign in was cancelled' };
    }

    if (result.type === 'error') {
      return { success: false, error: result.error?.message || 'Sign in failed' };
    }

    return { success: false, error: 'Sign in failed' };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign in with Google',
    };
  }
};

/**
 * Sign in with GitHub OAuth
 */
export const signInWithGitHub = async (): Promise<AuthResult> => {
  try {
    const redirectUri = getRedirectUri();
    console.log('GitHub OAuth redirect URI:', redirectUri);

    const request = new AuthSession.AuthRequest({
      clientId: config.oauth.github.clientId,
      scopes: ['read:user', 'user:email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
    });

    const result = await request.promptAsync(githubDiscovery);

    if (result.type === 'success' && result.params.code) {
      // Exchange code for tokens via our backend
      return await exchangeCodeForTokens('github', result.params.code, redirectUri);
    }

    if (result.type === 'cancel') {
      return { success: false, error: 'Sign in was cancelled' };
    }

    return { success: false, error: 'Sign in failed' };
  } catch (error) {
    console.error('GitHub sign-in error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign in with GitHub',
    };
  }
};

/**
 * Exchange OAuth code for tokens via backend
 */
const exchangeCodeForTokens = async (
  provider: OAuthProvider,
  code: string,
  redirectUri: string,
  codeVerifier?: string
): Promise<AuthResult> => {
  try {
    const response = await fetch(`${config.api.baseUrl}/auth/mobile/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        code,
        redirectUri,
        codeVerifier,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Authentication failed');
    }

    const data = await response.json();

    // Store tokens securely
    if (data.accessToken) {
      await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
    }
    if (data.refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    if (data.user) {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));
    }

    return {
      success: true,
      token: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    };
  } catch (error) {
    console.error('Token exchange error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete authentication',
    };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      // Notify backend of sign out
      await fetch(`${config.api.baseUrl}/auth/signout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch(() => {
        // Ignore errors - still clear local tokens
      });
    }
  } finally {
    // Clear all stored auth data
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => {});
    await SecureStore.deleteItemAsync(USER_KEY).catch(() => {});
  }
};

/**
 * Get the stored authentication token
 */
export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Get the stored user data
 */
export const getStoredUser = async (): Promise<User | null> => {
  try {
    const userData = await SecureStore.getItemAsync(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getStoredToken();
  return !!token;
};

/**
 * Refresh the authentication token
 */
export const refreshAuthToken = async (): Promise<AuthResult> => {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    const response = await fetch(`${config.api.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();

    if (data.accessToken) {
      await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
    }
    if (data.refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
    }

    return {
      success: true,
      token: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    // Clear tokens on refresh failure
    await signOut();
    return {
      success: false,
      error: 'Session expired. Please sign in again.',
    };
  }
};

/**
 * Get the current user from the backend
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = await getStoredToken();
    if (!token) return null;

    const response = await fetch(`${config.api.baseUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        const refreshResult = await refreshAuthToken();
        if (refreshResult.success && refreshResult.user) {
          return refreshResult.user;
        }
      }
      return null;
    }

    const user = await response.json();
    // Update stored user data
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Validate the stored token and return user if valid
 */
export const validateToken = async (): Promise<User | null> => {
  try {
    const token = await getStoredToken();
    if (!token) return null;
    
    // Validate with backend
    const user = await getCurrentUser();
    
    if (!user) {
      await signOut();
      return null;
    }

    return user;
  } catch {
    await signOut();
    return null;
  }
};
