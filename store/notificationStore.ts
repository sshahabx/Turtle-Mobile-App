/**
 * Notification Store
 *
 * Manages notification state and preferences using Zustand with AsyncStorage persistence.
 * Handles adding, reading, and deleting notifications with a max limit of 100.
 *
 * Requirements:
 * - 5.1: Persist notifications to local storage
 * - 5.2: Maintain maximum of 100 notifications (oldest removed when exceeded)
 * - 5.3: Track read/unread status for each notification
 * - 5.4: Provide methods to add, mark as read, and delete notifications
 * - 5.5: Restore notifications from local storage on app launch
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import {
  Notification,
  NotificationPreferences,
  NotificationCreateInput,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '../types/notifications';

// Maximum number of notifications to store
const MAX_NOTIFICATIONS = 100;

// Storage keys
const STORAGE_KEY = 'turtle-notification-store';

interface NotificationState {
  // State
  notifications: Notification[];
  preferences: NotificationPreferences;

  // Actions
  addNotification: (input: NotificationCreateInput) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;

  // Computed
  getUnreadCount: () => number;
}

/**
 * Custom storage adapter for AsyncStorage with date serialization support
 */
const asyncStorageAdapter = {
  getItem: async (name: string): Promise<string | null> => {
    return AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await AsyncStorage.removeItem(name);
  },
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      preferences: DEFAULT_NOTIFICATION_PREFERENCES,

      // Add a new notification
      addNotification: (input: NotificationCreateInput) => {
        const newNotification: Notification = {
          id: Crypto.randomUUID(),
          type: input.type,
          title: input.title,
          body: input.body,
          timestamp: new Date(),
          read: false,
          data: input.data,
        };

        set((state) => {
          // Add new notification at the beginning (newest first)
          let updatedNotifications = [newNotification, ...state.notifications];

          // Enforce max limit - remove oldest notifications if exceeded
          if (updatedNotifications.length > MAX_NOTIFICATIONS) {
            updatedNotifications = updatedNotifications.slice(0, MAX_NOTIFICATIONS);
          }

          return { notifications: updatedNotifications };
        });
      },

      // Mark a single notification as read
      markAsRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      // Mark all notifications as read
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      // Delete a single notification
      deleteNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      // Clear all notifications
      clearAllNotifications: () => {
        set({ notifications: [] });
      },

      // Update notification preferences
      updatePreferences: (prefs: Partial<NotificationPreferences>) => {
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        }));
      },

      // Get count of unread notifications
      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => asyncStorageAdapter),
      // Custom serialization to handle Date objects
      partialize: (state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          timestamp: n.timestamp instanceof Date ? n.timestamp.toISOString() : n.timestamp,
        })),
        preferences: state.preferences,
      }),
      // Custom deserialization to restore Date objects
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.notifications = state.notifications.map((n) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }));
        }
      },
    }
  )
);

// Export constants for testing
export { MAX_NOTIFICATIONS };
