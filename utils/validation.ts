// Validation utility functions for JobAppTracker Mobile

import type { JobCreateInput, NoteCreateInput, TaskCreateInput, HabitCreateInput } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Checks if a string is non-empty (not null, undefined, or whitespace-only)
 * @param value - The string to check
 * @returns True if the string contains non-whitespace characters
 */
export function isNonEmptyString(value: string | null | undefined): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  return value.trim().length > 0;
}

/**
 * Validates job creation input
 * @param input - The job input to validate
 * @returns Validation result with errors if any
 */
export function validateJobInput(input: Partial<JobCreateInput>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!isNonEmptyString(input.title)) {
    errors.push({
      field: 'title',
      message: 'Title is required',
    });
  }

  if (!isNonEmptyString(input.company)) {
    errors.push({
      field: 'company',
      message: 'Company is required',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates note creation input
 * @param input - The note input to validate
 * @returns Validation result with errors if any
 */
export function validateNoteInput(input: Partial<NoteCreateInput>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!isNonEmptyString(input.title)) {
    errors.push({
      field: 'title',
      message: 'Title is required',
    });
  }

  if (!isNonEmptyString(input.content)) {
    errors.push({
      field: 'content',
      message: 'Content is required',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates task creation input
 * @param input - The task input to validate
 * @returns Validation result with errors if any
 */
export function validateTaskInput(input: Partial<TaskCreateInput>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!isNonEmptyString(input.title)) {
    errors.push({
      field: 'title',
      message: 'Title is required',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}


/**
 * Validates habit creation input
 * @param input - The habit input to validate
 * @returns Validation result with errors if any
 */
export function validateHabitInput(input: Partial<HabitCreateInput>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!isNonEmptyString(input.name)) {
    errors.push({
      field: 'name',
      message: 'Name is required',
    });
  }

  // Validate targetDays if provided
  if (input.targetDays !== undefined) {
    if (typeof input.targetDays !== 'number' || input.targetDays < 1 || input.targetDays > 365) {
      errors.push({
        field: 'targetDays',
        message: 'Target days must be between 1 and 365',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
