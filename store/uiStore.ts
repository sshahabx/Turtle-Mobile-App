/**
 * UI Preferences Store
 *
 * Manages UI state and preferences with persistence using Zustand.
 * Persists user preferences to AsyncStorage for restoration across app restarts.
 *
 * Requirements:
 * - 11.4: Persist sorting preferences for future sessions
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JobStatus } from '../types';

// Sort options for job lists
export type SortBy = 'date' | 'title' | 'company';

// View mode options
export type ViewMode = 'list' | 'grid';

// Theme mode options
export type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  // State
  sortBy: SortBy;
  viewMode: ViewMode;
  expandedSections: JobStatus[];
  themeMode: ThemeMode;

  // Actions
  setSortBy: (sort: SortBy) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleSection: (status: JobStatus) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// Default expanded sections - show all by default
const defaultExpandedSections: JobStatus[] = [
  JobStatus.PENDING,
  JobStatus.APPLIED,
  JobStatus.INTERVIEWING,
  JobStatus.OFFERED,
  JobStatus.ACCEPTED,
  JobStatus.REJECTED,
];

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      sortBy: 'date',
      viewMode: 'list',
      expandedSections: defaultExpandedSections,
      themeMode: 'system',

      // Actions
      setSortBy: (sort) =>
        set({
          sortBy: sort,
        }),

      setViewMode: (mode) =>
        set({
          viewMode: mode,
        }),

      toggleSection: (status) =>
        set((state) => {
          const isExpanded = state.expandedSections.includes(status);
          return {
            expandedSections: isExpanded
              ? state.expandedSections.filter((s) => s !== status)
              : [...state.expandedSections, status],
          };
        }),

      setThemeMode: (mode) =>
        set({
          themeMode: mode,
        }),

      toggleTheme: () =>
        set((state) => {
          const modes: ThemeMode[] = ['light', 'dark', 'system'];
          const currentIndex = modes.indexOf(state.themeMode);
          const nextIndex = (currentIndex + 1) % modes.length;
          return { themeMode: modes[nextIndex] };
        }),
    }),
    {
      name: 'job-tracker-ui-preferences',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these specific fields
      partialize: (state) => ({
        sortBy: state.sortBy,
        viewMode: state.viewMode,
        expandedSections: state.expandedSections,
        themeMode: state.themeMode,
      }),
    }
  )
);
