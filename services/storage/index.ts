/**
 * Storage services index
 *
 * Exports all storage-related functionality:
 * - SecureStorage: For sensitive data like auth tokens
 * - AsyncStorage: For UI preferences and non-sensitive data
 */

// Secure storage for tokens (Requirements 1.3, 1.6)
export {
  storeToken,
  getToken,
  clearToken,
  storeRefreshToken,
  getRefreshToken,
  clearRefreshToken,
  clearAllTokens,
  hasToken,
  STORAGE_KEYS as SECURE_STORAGE_KEYS,
} from './secureStorage';

// Async storage for preferences (Requirement 11.4)
export {
  storePreference,
  getPreference,
  removePreference,
  clearAllPreferences,
  getMultiplePreferences,
  storeMultiplePreferences,
  PREFERENCE_KEYS,
} from './asyncStorage';
