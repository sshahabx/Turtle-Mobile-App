/**
 * SecureStore wrapper for token management
 *
 * Provides secure storage for sensitive data like authentication tokens
 * using Expo SecureStore (encrypted storage).
 *
 * Requirements:
 * - 1.3: Store JWT token in SecureStore after authentication
 * - 1.6: Clear stored tokens on sign-out
 */

import * as SecureStore from 'expo-secure-store';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Store a value securely
 * @param key - The storage key
 * @param value - The value to store
 * @throws Error if storage fails
 */
const setSecureItem = async (key: StorageKey, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Failed to store secure item [${key}]:`, error);
    throw new Error(`Failed to store secure data: ${key}`);
  }
};

/**
 * Retrieve a value from secure storage
 * @param key - The storage key
 * @returns The stored value or null if not found
 */
const getSecureItem = async (key: StorageKey): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Failed to retrieve secure item [${key}]:`, error);
    return null;
  }
};

/**
 * Delete a value from secure storage
 * @param key - The storage key
 */
const deleteSecureItem = async (key: StorageKey): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    // Silently handle deletion errors - item may not exist
    console.warn(`Failed to delete secure item [${key}]:`, error);
  }
};

// ============================================================================
// Token Management Functions
// ============================================================================

/**
 * Store the authentication token securely
 * @param token - The JWT token to store
 */
export const storeToken = async (token: string): Promise<void> => {
  await setSecureItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Retrieve the stored authentication token
 * @returns The stored token or null if not found
 */
export const getToken = async (): Promise<string | null> => {
  return getSecureItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Clear the stored authentication token
 */
export const clearToken = async (): Promise<void> => {
  await deleteSecureItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Store the refresh token securely
 * @param token - The refresh token to store
 */
export const storeRefreshToken = async (token: string): Promise<void> => {
  await setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, token);
};

/**
 * Retrieve the stored refresh token
 * @returns The stored refresh token or null if not found
 */
export const getRefreshToken = async (): Promise<string | null> => {
  return getSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Clear the stored refresh token
 */
export const clearRefreshToken = async (): Promise<void> => {
  await deleteSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Clear all authentication tokens (both auth and refresh)
 * Used during sign-out to ensure complete cleanup
 */
export const clearAllTokens = async (): Promise<void> => {
  await Promise.all([clearToken(), clearRefreshToken()]);
};

/**
 * Check if a valid token exists
 * @returns true if a token is stored, false otherwise
 */
export const hasToken = async (): Promise<boolean> => {
  const token = await getToken();
  return token !== null && token.length > 0;
};

// Export storage keys for testing purposes
export { STORAGE_KEYS };
