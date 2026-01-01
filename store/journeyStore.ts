/**
 * Journey Store
 *
 * Manages journey state for the Career Journey (Forest Map) feature using Zustand
 * with AsyncStorage persistence. Handles career score, levels, milestones, and
 * offline queue management.
 *
 * Requirements:
 * - 6.2: Accumulate points into a Career_Score that persists across sessions
 * - 6.4: Do not reset points or penalize user inactivity
 * - 8.1: Persist Career_Score, completed levels, unlocked milestones, and node reflections
 * - 8.4: Queue updates and sync when connectivity returns
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import {
  JourneyState,
  JourneyLevel,
  Milestone,
  PointAction,
  PointActionType,
  VisualTier,
  MilestoneType,
} from '../types/journey';
import { getVisualTier } from '../config/visualTiers';
import { MILESTONE_CONFIG, MILESTONE_TYPES } from '../config/milestones';

// Storage key
const STORAGE_KEY = 'turtle-journey-store';

// Point values for each action type
export const POINT_VALUES: Record<PointActionType, number> = {
  job_added: 10,
  task_completed: 5,
  habit_completed: 5,
};

/**
 * Types of journey updates that can be queued for offline sync
 */
export type JourneyUpdateType = 
  | 'award_points'
  | 'complete_level'
  | 'unlock_milestone'
  | 'save_reflection';

/**
 * Represents a pending journey update to be synced when online
 */
export interface JourneyUpdate {
  id: string;
  type: JourneyUpdateType;
  payload: unknown;
  timestamp: Date;
}

/**
 * Journey store state interface
 */
interface JourneyStoreState {
  // State
  journeyState: JourneyState | null;
  isLoading: boolean;
  pendingUpdates: JourneyUpdate[];

  // Actions
  loadJourneyState: () => Promise<void>;
  initializeJourneyState: () => void;
  awardPoints: (actionType: PointActionType) => void;
  completeLevel: (acceptedJobId: string) => void;
  unlockMilestone: (milestoneType: MilestoneType) => void;
  saveReflection: (milestoneId: string, text: string) => void;
  syncPendingUpdates: () => Promise<void>;
  clearPendingUpdates: () => void;

  // Computed helpers
  getCareerScore: () => number;
  getCurrentLevel: () => JourneyLevel | null;
  getMilestoneById: (id: string) => Milestone | undefined;
}

/**
 * Creates the initial Level 0 "Job Hunt" level
 */
function createInitialLevel(): JourneyLevel {
  return {
    id: Crypto.randomUUID(),
    levelNumber: 0,
    title: 'Job Hunt',
    startedAt: new Date(),
    completedAt: undefined,
    acceptedJobId: undefined,
  };
}

/**
 * Creates initial milestones from configuration
 */
function createInitialMilestones(): Milestone[] {
  return MILESTONE_TYPES.map((type) => {
    const config = MILESTONE_CONFIG[type];
    return {
      id: Crypto.randomUUID(),
      type,
      title: config.title,
      description: config.description,
      threshold: config.threshold,
      unlockedAt: undefined,
      reflection: undefined,
    };
  });
}

/**
 * Creates the initial journey state for new users
 */
function createInitialJourneyState(): JourneyState {
  return {
    currentLevel: createInitialLevel(),
    completedLevels: [],
    milestones: createInitialMilestones(),
    careerScore: 0,
    visualTier: 'seedling',
  };
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

/**
 * Serializes journey state for storage (converts Dates to ISO strings)
 */
function serializeJourneyState(state: JourneyState): unknown {
  return {
    ...state,
    currentLevel: {
      ...state.currentLevel,
      startedAt: state.currentLevel.startedAt instanceof Date 
        ? state.currentLevel.startedAt.toISOString() 
        : state.currentLevel.startedAt,
      completedAt: state.currentLevel.completedAt instanceof Date 
        ? state.currentLevel.completedAt.toISOString() 
        : state.currentLevel.completedAt,
    },
    completedLevels: state.completedLevels.map((level) => ({
      ...level,
      startedAt: level.startedAt instanceof Date 
        ? level.startedAt.toISOString() 
        : level.startedAt,
      completedAt: level.completedAt instanceof Date 
        ? level.completedAt.toISOString() 
        : level.completedAt,
    })),
    milestones: state.milestones.map((milestone) => ({
      ...milestone,
      unlockedAt: milestone.unlockedAt instanceof Date 
        ? milestone.unlockedAt.toISOString() 
        : milestone.unlockedAt,
    })),
  };
}

/**
 * Deserializes journey state from storage (converts ISO strings to Dates)
 */
function deserializeJourneyState(data: unknown): JourneyState {
  const state = data as JourneyState & {
    currentLevel: JourneyLevel & { startedAt: string; completedAt?: string };
    completedLevels: Array<JourneyLevel & { startedAt: string; completedAt?: string }>;
    milestones: Array<Milestone & { unlockedAt?: string }>;
  };

  return {
    ...state,
    currentLevel: {
      ...state.currentLevel,
      startedAt: new Date(state.currentLevel.startedAt),
      completedAt: state.currentLevel.completedAt 
        ? new Date(state.currentLevel.completedAt) 
        : undefined,
    },
    completedLevels: state.completedLevels.map((level) => ({
      ...level,
      startedAt: new Date(level.startedAt),
      completedAt: level.completedAt ? new Date(level.completedAt) : undefined,
    })),
    milestones: state.milestones.map((milestone) => ({
      ...milestone,
      unlockedAt: milestone.unlockedAt ? new Date(milestone.unlockedAt) : undefined,
    })),
  };
}

export const useJourneyStore = create<JourneyStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      journeyState: null,
      isLoading: true,
      pendingUpdates: [],

      // Load journey state (called on app start)
      loadJourneyState: async () => {
        set({ isLoading: true });
        try {
          // State is automatically loaded by persist middleware
          // This method is for explicit reload or initialization
          const currentState = get().journeyState;
          if (!currentState) {
            // Initialize with default state if none exists
            set({ journeyState: createInitialJourneyState() });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      // Initialize journey state for new users
      initializeJourneyState: () => {
        set({ journeyState: createInitialJourneyState() });
      },

      // Award points for an action (monotonically increasing)
      awardPoints: (actionType: PointActionType) => {
        const points = POINT_VALUES[actionType];
        if (!points) return;

        set((state) => {
          if (!state.journeyState) {
            // Initialize state if not present
            const newState = createInitialJourneyState();
            newState.careerScore = points;
            newState.visualTier = getVisualTier(points);
            return { journeyState: newState };
          }

          const newScore = state.journeyState.careerScore + points;
          const newTier = getVisualTier(newScore);

          // Add to pending updates for offline sync
          const update: JourneyUpdate = {
            id: Crypto.randomUUID(),
            type: 'award_points',
            payload: { actionType, points, newScore },
            timestamp: new Date(),
          };

          return {
            journeyState: {
              ...state.journeyState,
              careerScore: newScore,
              visualTier: newTier,
            },
            pendingUpdates: [...state.pendingUpdates, update],
          };
        });
      },

      // Complete current level and start a new one
      completeLevel: (acceptedJobId: string) => {
        set((state) => {
          if (!state.journeyState) return state;

          const now = new Date();
          const completedLevel: JourneyLevel = {
            ...state.journeyState.currentLevel,
            completedAt: now,
            acceptedJobId,
          };

          const newLevel: JourneyLevel = {
            id: Crypto.randomUUID(),
            levelNumber: state.journeyState.currentLevel.levelNumber + 1,
            title: `Level ${state.journeyState.currentLevel.levelNumber + 1}`,
            startedAt: now,
            completedAt: undefined,
            acceptedJobId: undefined,
          };

          // Add to pending updates for offline sync
          const update: JourneyUpdate = {
            id: Crypto.randomUUID(),
            type: 'complete_level',
            payload: { completedLevel, newLevel },
            timestamp: now,
          };

          return {
            journeyState: {
              ...state.journeyState,
              currentLevel: newLevel,
              completedLevels: [...state.journeyState.completedLevels, completedLevel],
            },
            pendingUpdates: [...state.pendingUpdates, update],
          };
        });
      },

      // Unlock a milestone
      unlockMilestone: (milestoneType: MilestoneType) => {
        set((state) => {
          if (!state.journeyState) return state;

          const now = new Date();
          const updatedMilestones = state.journeyState.milestones.map((milestone) => {
            if (milestone.type === milestoneType && !milestone.unlockedAt) {
              return { ...milestone, unlockedAt: now };
            }
            return milestone;
          });

          // Add to pending updates for offline sync
          const update: JourneyUpdate = {
            id: Crypto.randomUUID(),
            type: 'unlock_milestone',
            payload: { milestoneType, unlockedAt: now },
            timestamp: now,
          };

          return {
            journeyState: {
              ...state.journeyState,
              milestones: updatedMilestones,
            },
            pendingUpdates: [...state.pendingUpdates, update],
          };
        });
      },

      // Save reflection text for a milestone
      saveReflection: (milestoneId: string, text: string) => {
        set((state) => {
          if (!state.journeyState) return state;

          const updatedMilestones = state.journeyState.milestones.map((milestone) => {
            if (milestone.id === milestoneId) {
              return { ...milestone, reflection: text };
            }
            return milestone;
          });

          // Add to pending updates for offline sync
          const update: JourneyUpdate = {
            id: Crypto.randomUUID(),
            type: 'save_reflection',
            payload: { milestoneId, text },
            timestamp: new Date(),
          };

          return {
            journeyState: {
              ...state.journeyState,
              milestones: updatedMilestones,
            },
            pendingUpdates: [...state.pendingUpdates, update],
          };
        });
      },

      // Sync pending updates when online
      syncPendingUpdates: async () => {
        const { pendingUpdates } = get();
        if (pendingUpdates.length === 0) return;

        // TODO: Implement actual API sync when backend is ready
        // For now, just clear the pending updates after "sync"
        set({ pendingUpdates: [] });
      },

      // Clear pending updates (used after successful sync)
      clearPendingUpdates: () => {
        set({ pendingUpdates: [] });
      },

      // Get current career score
      getCareerScore: () => {
        return get().journeyState?.careerScore ?? 0;
      },

      // Get current level
      getCurrentLevel: () => {
        return get().journeyState?.currentLevel ?? null;
      },

      // Get milestone by ID
      getMilestoneById: (id: string) => {
        return get().journeyState?.milestones.find((m) => m.id === id);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => asyncStorageAdapter),
      // Custom serialization to handle Date objects
      partialize: (state) => ({
        journeyState: state.journeyState 
          ? serializeJourneyState(state.journeyState) 
          : null,
        pendingUpdates: state.pendingUpdates.map((update) => ({
          ...update,
          timestamp: update.timestamp instanceof Date 
            ? update.timestamp.toISOString() 
            : update.timestamp,
        })),
      }),
      // Custom deserialization to restore Date objects
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.journeyState) {
            state.journeyState = deserializeJourneyState(state.journeyState);
          }
          state.pendingUpdates = state.pendingUpdates.map((update) => ({
            ...update,
            timestamp: new Date(update.timestamp as unknown as string),
          }));
          state.isLoading = false;
        }
      },
    }
  )
);

// Export helper functions for testing
export {
  createInitialLevel,
  createInitialMilestones,
  createInitialJourneyState,
  serializeJourneyState,
  deserializeJourneyState,
};
