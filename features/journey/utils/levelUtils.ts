/**
 * Level Utility Functions
 *
 * Provides utility functions for managing journey levels, including
 * initialization, completion, and validation.
 *
 * Requirements:
 * - 3.1: Initialize all users at Level 0 titled "Job Hunt"
 * - 3.2: Complete current level and create new level when job is accepted
 * - 3.6: Display level title and completion date for each completed level
 */

import * as Crypto from 'expo-crypto';
import type { JourneyLevel } from '../../../types/journey';

/**
 * Creates the initial Level 0 "Job Hunt" level for new users.
 *
 * @returns A new JourneyLevel at level 0 with title "Job Hunt"
 *
 * Requirements: 3.1 - Initialize all users at Level 0 titled "Job Hunt"
 */
export function createInitialLevel(): JourneyLevel {
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
 * Completes the current level and creates a new level.
 * The current level is marked as completed with the accepted job ID,
 * and a new level is created with an incremented level number.
 *
 * @param currentLevel - The current level to complete
 * @param acceptedJobId - The ID of the accepted job that completes this level
 * @returns An object containing the completed level and the new current level
 *
 * Requirements:
 * - 3.2: Complete current level and create new level when job is accepted
 * - 3.3: Increment level numbers sequentially
 */
export function completeLevel(
  currentLevel: JourneyLevel,
  acceptedJobId: string
): { completedLevel: JourneyLevel; newLevel: JourneyLevel } {
  const now = new Date();

  // Mark the current level as completed
  const completedLevel: JourneyLevel = {
    ...currentLevel,
    completedAt: now,
    acceptedJobId,
  };

  // Create the new level with incremented level number
  const newLevel: JourneyLevel = {
    id: Crypto.randomUUID(),
    levelNumber: currentLevel.levelNumber + 1,
    title: `Level ${currentLevel.levelNumber + 1}`,
    startedAt: now,
    completedAt: undefined,
    acceptedJobId: undefined,
  };

  return { completedLevel, newLevel };
}

/**
 * Validates that a JourneyLevel has all required data.
 * For completed levels, validates that both title and completedAt are present.
 * For active levels, validates that title and startedAt are present.
 *
 * @param level - The level to validate
 * @returns true if the level data is valid, false otherwise
 *
 * Requirements: 3.6 - Display level title and completion date for each completed level
 */
export function validateLevelData(level: JourneyLevel): boolean {
  // Basic validation - must have id, levelNumber, title, and startedAt
  if (!level.id || level.id.trim() === '') {
    return false;
  }

  if (typeof level.levelNumber !== 'number' || level.levelNumber < 0) {
    return false;
  }

  if (!level.title || level.title.trim() === '') {
    return false;
  }

  if (!(level.startedAt instanceof Date) || isNaN(level.startedAt.getTime())) {
    return false;
  }

  // For completed levels, must have valid completedAt date
  if (level.completedAt !== undefined) {
    if (!(level.completedAt instanceof Date) || isNaN(level.completedAt.getTime())) {
      return false;
    }
  }

  return true;
}

/**
 * Validates that a completed level has all required data.
 * A completed level must have a non-empty title and a valid completedAt date.
 *
 * @param level - The completed level to validate
 * @returns true if the completed level data is valid, false otherwise
 *
 * Requirements: 3.6 - Display level title and completion date for each completed level
 */
export function validateCompletedLevelData(level: JourneyLevel): boolean {
  // Must pass basic validation
  if (!validateLevelData(level)) {
    return false;
  }

  // Completed levels must have a completedAt date
  if (!level.completedAt) {
    return false;
  }

  // Completed levels must have a non-empty title
  if (!level.title || level.title.trim() === '') {
    return false;
  }

  return true;
}

/**
 * Checks if a level is the initial Level 0 "Job Hunt" level.
 *
 * @param level - The level to check
 * @returns true if this is the initial level, false otherwise
 */
export function isInitialLevel(level: JourneyLevel): boolean {
  return level.levelNumber === 0 && level.title === 'Job Hunt';
}

/**
 * Gets the display title for a level.
 * Level 0 is always "Job Hunt", subsequent levels are "Level N".
 *
 * @param levelNumber - The level number
 * @returns The display title for the level
 */
export function getLevelTitle(levelNumber: number): string {
  if (levelNumber === 0) {
    return 'Job Hunt';
  }
  return `Level ${levelNumber}`;
}

/**
 * Calculates the next level number after the current level.
 *
 * @param currentLevelNumber - The current level number
 * @returns The next level number (currentLevelNumber + 1)
 */
export function getNextLevelNumber(currentLevelNumber: number): number {
  return currentLevelNumber + 1;
}
