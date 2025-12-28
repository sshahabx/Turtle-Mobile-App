/**
 * Habits Service
 * 
 * Provides habit-related API operations with proper typing and date parsing.
 * Wraps the core API service for use within the habits feature.
 * 
 * Requirements:
 * - 10.1: Display all habits with current streak information
 * - 10.2: Create habit via API
 * - 10.3: Record HabitEntry for today and update streak counts
 * - 10.5: Display habit details with completion history
 */

import { habitsService as apiHabitsService } from '../../../services/api/services';
import { Habit, HabitCreateInput, HabitUpdateInput } from '../../../types';

/**
 * Habits Service - Feature-level API for habit operations
 */
export const habitsService = {
  /**
   * Fetches all habits for the authenticated user
   * @returns Promise resolving to array of habits with parsed dates
   */
  async getHabits(): Promise<Habit[]> {
    return apiHabitsService.getHabits();
  },

  /**
   * Fetches a single habit by ID
   * @param id - The habit ID to fetch
   * @returns Promise resolving to the habit with parsed dates
   */
  async getHabit(id: string): Promise<Habit> {
    return apiHabitsService.getHabit(id);
  },

  /**
   * Creates a new habit
   * @param data - The habit creation input
   * @returns Promise resolving to the created habit with parsed dates
   */
  async createHabit(data: HabitCreateInput): Promise<Habit> {
    return apiHabitsService.createHabit(data);
  },

  /**
   * Updates an existing habit
   * @param id - The habit ID to update
   * @param data - The habit update input
   * @returns Promise resolving to the updated habit with parsed dates
   */
  async updateHabit(id: string, data: HabitUpdateInput): Promise<Habit> {
    return apiHabitsService.updateHabit(id, data);
  },

  /**
   * Deletes a habit
   * @param id - The habit ID to delete
   * @returns Promise resolving when deletion is complete
   */
  async deleteHabit(id: string): Promise<void> {
    return apiHabitsService.deleteHabit(id);
  },

  /**
   * Marks a habit as completed for today
   * Records a HabitEntry for today's date and updates streak counts
   * @param id - The habit ID to complete
   * @returns Promise resolving to the updated habit with new streak info
   */
  async completeHabit(id: string): Promise<Habit> {
    return apiHabitsService.completeHabit(id);
  },
};

export default habitsService;
