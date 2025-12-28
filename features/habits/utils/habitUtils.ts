/**
 * Habit Utility Functions
 * 
 * Provides utility functions for habit-related operations.
 * 
 * Requirements:
 * - 10.6: Display completed indicator and disable complete button for habits completed today
 */

import { Habit, HabitEntry } from '../../../types';
import { isToday } from '../../../utils/date';

/**
 * Checks if a habit has been completed today
 * Used to determine if the complete button should be disabled
 * 
 * @param habit - The habit to check
 * @returns True if the habit has been completed today
 * 
 * Requirement 10.6: WHEN a habit is already completed today 
 * THEN the Job_Tracker_Mobile SHALL display a completed indicator and disable the complete button
 */
export function isCompletedToday(habit: Habit): boolean {
  // Check lastCompleted field
  if (habit.lastCompleted && isToday(habit.lastCompleted)) {
    return true;
  }

  return false;
}

/**
 * Gets the completion status text for a habit
 * @param habit - The habit to check
 * @returns Status text for display
 */
export function getCompletionStatusText(habit: Habit): string {
  if (isCompletedToday(habit)) {
    return 'Completed today';
  }
  
  if (habit.lastCompleted) {
    const daysSinceCompletion = Math.floor(
      (Date.now() - habit.lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceCompletion === 1) {
      return 'Last completed yesterday';
    }
    
    return `Last completed ${daysSinceCompletion} days ago`;
  }
  
  return 'Not yet completed';
}

/**
 * Calculates the streak status for a habit
 * @param habit - The habit to analyze
 * @returns Object with streak information
 */
export function getStreakInfo(habit: Habit): {
  currentStreak: number;
  bestStreak: number;
  isActive: boolean;
  streakPercentage: number;
} {
  const isActive = isCompletedToday(habit) || 
    (habit.lastCompleted !== undefined && 
     Math.floor((Date.now() - habit.lastCompleted.getTime()) / (1000 * 60 * 60 * 24)) <= 1);
  
  const streakPercentage = habit.targetDays > 0 
    ? Math.min(100, (habit.currentStreak / habit.targetDays) * 100)
    : 0;

  return {
    currentStreak: habit.currentStreak,
    bestStreak: habit.bestStreak,
    isActive,
    streakPercentage,
  };
}

/**
 * Sorts habits by completion status (incomplete first) and then by name
 * @param habits - Array of habits to sort
 * @returns Sorted array of habits
 */
export function sortHabitsByCompletion(habits: Habit[]): Habit[] {
  return [...habits].sort((a, b) => {
    const aCompleted = isCompletedToday(a);
    const bCompleted = isCompletedToday(b);
    
    // Incomplete habits come first
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1;
    }
    
    // Then sort by name alphabetically
    return a.name.localeCompare(b.name);
  });
}
