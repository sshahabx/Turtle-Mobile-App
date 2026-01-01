/**
 * Journey Service
 *
 * Provides journey-related operations for the Career Journey feature.
 * Handles journey state management, level completion, milestone unlocking,
 * and reflection saving with support for both API and local storage modes.
 *
 * Requirements:
 * - 3.2: Complete current level and create new level when job is accepted
 * - 4.2: Unlock milestones when corresponding activity is completed
 * - 5.3: Include optional short reflection text field for user notes
 * - 8.1: Persist Career_Score, completed levels, unlocked milestones, and node reflections
 * - 8.3: Sync journey data with the backend for authenticated users
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  JourneyState,
  JourneyLevel,
  Milestone,
  MilestoneType,
  JourneyStats,
} from '../../../types/journey';
import { useJourneyStore, serializeJourneyState, deserializeJourneyState } from '../../../store/journeyStore';
import { MILESTONE_CONFIG, shouldUnlockMilestone } from '../../../config/milestones';

// Storage key for local journey state backup
const JOURNEY_STATE_STORAGE_KEY = '@jobtracker:journey_state';

/**
 * Journey Service - Feature-level API for journey operations
 */
export const journeyService = {
  /**
   * Gets the current journey state from the store
   * Falls back to local storage if store is not initialized
   *
   * @returns Promise resolving to the journey state or null
   */
  async getJourneyState(): Promise<JourneyState | null> {
    // First try to get from store
    const storeState = useJourneyStore.getState().journeyState;
    if (storeState) {
      return storeState;
    }

    // Fall back to local storage
    try {
      const stored = await AsyncStorage.getItem(JOURNEY_STATE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return deserializeJourneyState(parsed);
      }
    } catch (error) {
      console.error('Error loading journey state from storage:', error);
    }

    return null;
  },

  /**
   * Completes the current level when a job is accepted
   * Creates a new level and moves the current level to completed levels
   *
   * @param acceptedJobId - The ID of the accepted job
   * @returns Promise resolving to the new current level
   */
  async completeLevel(acceptedJobId: string): Promise<JourneyLevel> {
    const store = useJourneyStore.getState();
    
    // Complete the level in the store
    store.completeLevel(acceptedJobId);

    // Get the updated state
    const updatedState = useJourneyStore.getState().journeyState;
    if (!updatedState) {
      throw new Error('Journey state not initialized');
    }

    // Persist to local storage as backup
    await this.saveJourneyStateToStorage(updatedState);

    return updatedState.currentLevel;
  },

  /**
   * Unlocks a milestone by type
   *
   * @param milestoneType - The type of milestone to unlock
   * @returns Promise resolving to the unlocked milestone or null if already unlocked
   */
  async unlockMilestone(milestoneType: MilestoneType): Promise<Milestone | null> {
    const store = useJourneyStore.getState();
    const currentState = store.journeyState;

    if (!currentState) {
      throw new Error('Journey state not initialized');
    }

    // Check if milestone is already unlocked
    const existingMilestone = currentState.milestones.find(
      (m) => m.type === milestoneType
    );
    if (existingMilestone?.unlockedAt) {
      return null; // Already unlocked
    }

    // Unlock the milestone in the store
    store.unlockMilestone(milestoneType);

    // Get the updated state
    const updatedState = useJourneyStore.getState().journeyState;
    if (!updatedState) {
      throw new Error('Journey state not initialized');
    }

    // Persist to local storage as backup
    await this.saveJourneyStateToStorage(updatedState);

    // Return the unlocked milestone
    return updatedState.milestones.find((m) => m.type === milestoneType) || null;
  },

  /**
   * Checks and unlocks any milestones that should be unlocked based on stats
   *
   * @param stats - The current journey statistics
   * @returns Promise resolving to array of newly unlocked milestones
   */
  async checkAndUnlockMilestones(stats: JourneyStats): Promise<Milestone[]> {
    const store = useJourneyStore.getState();
    const currentState = store.journeyState;

    if (!currentState) {
      return [];
    }

    const newlyUnlocked: Milestone[] = [];

    for (const milestone of currentState.milestones) {
      // Skip already unlocked milestones
      if (milestone.unlockedAt) {
        continue;
      }

      // Check if milestone should be unlocked
      if (shouldUnlockMilestone(milestone.type, stats)) {
        const unlocked = await this.unlockMilestone(milestone.type);
        if (unlocked) {
          newlyUnlocked.push(unlocked);
        }
      }
    }

    return newlyUnlocked;
  },

  /**
   * Saves a reflection text for a milestone
   *
   * @param milestoneId - The ID of the milestone
   * @param text - The reflection text to save
   * @returns Promise resolving when saved
   */
  async saveReflection(milestoneId: string, text: string): Promise<void> {
    const store = useJourneyStore.getState();

    // Save reflection in the store
    store.saveReflection(milestoneId, text);

    // Get the updated state
    const updatedState = useJourneyStore.getState().journeyState;
    if (updatedState) {
      // Persist to local storage as backup
      await this.saveJourneyStateToStorage(updatedState);
    }
  },

  /**
   * Syncs the journey state with the backend
   * Called when network connectivity is available
   *
   * @param state - The journey state to sync
   * @returns Promise resolving when sync is complete
   */
  async syncJourneyState(state: JourneyState): Promise<void> {
    // TODO: Implement actual API sync when backend is ready
    // For now, just save to local storage
    await this.saveJourneyStateToStorage(state);

    // Clear pending updates after successful sync
    useJourneyStore.getState().clearPendingUpdates();
  },

  /**
   * Saves journey state to local storage as backup
   *
   * @param state - The journey state to save
   * @returns Promise resolving when saved
   */
  async saveJourneyStateToStorage(state: JourneyState): Promise<void> {
    try {
      const serialized = serializeJourneyState(state);
      await AsyncStorage.setItem(
        JOURNEY_STATE_STORAGE_KEY,
        JSON.stringify(serialized)
      );
    } catch (error) {
      console.error('Error saving journey state to storage:', error);
      throw error;
    }
  },

  /**
   * Loads journey state from local storage
   *
   * @returns Promise resolving to the journey state or null
   */
  async loadJourneyStateFromStorage(): Promise<JourneyState | null> {
    try {
      const stored = await AsyncStorage.getItem(JOURNEY_STATE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return deserializeJourneyState(parsed);
      }
    } catch (error) {
      console.error('Error loading journey state from storage:', error);
    }
    return null;
  },

  /**
   * Clears journey state from local storage
   * Used for testing or account reset
   *
   * @returns Promise resolving when cleared
   */
  async clearJourneyStateFromStorage(): Promise<void> {
    try {
      await AsyncStorage.removeItem(JOURNEY_STATE_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing journey state from storage:', error);
      throw error;
    }
  },

  /**
   * Gets the milestone configuration for a given type
   *
   * @param type - The milestone type
   * @returns The milestone definition
   */
  getMilestoneConfig(type: MilestoneType) {
    return MILESTONE_CONFIG[type];
  },

  /**
   * Gets the hint text for a locked milestone
   *
   * @param type - The milestone type
   * @returns The hint text
   */
  getMilestoneHint(type: MilestoneType): string {
    return MILESTONE_CONFIG[type].hint;
  },
};

export default journeyService;
