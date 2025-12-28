/**
 * AsyncStorage wrapper for UI preferences
 *
 * Provides persistent storage for non-sensitive UI state and preferences.
 * Uses AsyncStorage for simple key-value storage that persists across app restarts.
 *
 * Requirements:
 * - 11.4: Persist sorting preferences for future sessions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key prefix to namespace our app's data
const STORAGE_PREFIX = '@job_tracker:';

// Known preference keys
export const PREFERENCE_KEYS = {
  SORT_BY: 'sort_by',
  VIEW_MODE: 'view_mode',
  EXPANDED_SECTIONS: 'expanded_sections',
  THEME_PREFERENCE: 'theme_preference',
  ONBOARDING_COMPLETE: 'onboarding_complete',
} as const;

type PreferenceKey = (typeof PREFERENCE_KEYS)[keyof typeof PREFERENCE_KEYS];

/**
 * Get the full storage key with prefix
 */
const getFullKey = (key: PreferenceKey | string): string => {
  return `${STORAGE_PREFIX}${key}`;
};

/**
 * Store a preference value
 * @param key - The preference key
 * @param value - The value to store (will be JSON stringified)
 */
export const storePreference = async <T>(
  key: PreferenceKey | string,
  value: T
): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(getFullKey(key), jsonValue);
  } catch (error) {
    console.error(`Failed to store preference [${key}]:`, error);
    // Don't throw - preferences are non-critical
  }
};

/**
 * Retrieve a preference value
 * @param key - The preference key
 * @param defaultValue - Default value if preference doesn't exist
 * @returns The stored value or defaultValue if not found
 */
export const getPreference = async <T>(
  key: PreferenceKey | string,
  defaultValue: T
): Promise<T> => {
  try {
    const jsonValue = await AsyncStorage.getItem(getFullKey(key));
    if (jsonValue === null) {
      return defaultValue;
    }
    return JSON.parse(jsonValue) as T;
  } catch (error) {
    console.error(`Failed to retrieve preference [${key}]:`, error);
    return defaultValue;
  }
};

/**
 * Remove a preference
 * @param key - The preference key to remove
 */
export const removePreference = async (
  key: PreferenceKey | string
): Promise<void> => {
  try {
    await AsyncStorage.removeItem(getFullKey(key));
  } catch (error) {
    console.error(`Failed to remove preference [${key}]:`, error);
  }
};

/**
 * Clear all app preferences
 * Useful for resetting app state or during sign-out
 */
export const clearAllPreferences = async (): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const appKeys = allKeys.filter((key) => key.startsWith(STORAGE_PREFIX));
    if (appKeys.length > 0) {
      await AsyncStorage.multiRemove(appKeys);
    }
  } catch (error) {
    console.error('Failed to clear all preferences:', error);
  }
};

/**
 * Get multiple preferences at once
 * @param keys - Array of preference keys
 * @param defaults - Object with default values for each key
 * @returns Object with preference values
 */
export const getMultiplePreferences = async <T extends Record<string, unknown>>(
  keys: (PreferenceKey | string)[],
  defaults: T
): Promise<T> => {
  try {
    const fullKeys = keys.map(getFullKey);
    const pairs = await AsyncStorage.multiGet(fullKeys);

    const result = { ...defaults };
    pairs.forEach(([fullKey, value], index) => {
      const key = keys[index];
      if (value !== null) {
        try {
          (result as Record<string, unknown>)[key] = JSON.parse(value);
        } catch {
          // Keep default value if parsing fails
        }
      }
    });

    return result;
  } catch (error) {
    console.error('Failed to retrieve multiple preferences:', error);
    return defaults;
  }
};

/**
 * Store multiple preferences at once
 * @param preferences - Object with key-value pairs to store
 */
export const storeMultiplePreferences = async (
  preferences: Record<string, unknown>
): Promise<void> => {
  try {
    const pairs: [string, string][] = Object.entries(preferences).map(
      ([key, value]) => [getFullKey(key), JSON.stringify(value)]
    );
    await AsyncStorage.multiSet(pairs);
  } catch (error) {
    console.error('Failed to store multiple preferences:', error);
  }
};
