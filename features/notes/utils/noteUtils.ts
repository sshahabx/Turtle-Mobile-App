/**
 * Note Utility Functions
 * 
 * Provides utility functions for note operations including sorting.
 * 
 * Requirements:
 * - 8.1: Display notes sorted by last updated (most recent first)
 */

import { Note } from '../../../types';

/**
 * Sorts notes by updatedAt in descending order (most recent first)
 * 
 * @param notes - Array of notes to sort
 * @returns New array of notes sorted by updatedAt descending
 * 
 * Requirements: 8.1
 */
export function sortNotesByUpdatedAt(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    const dateA = a.updatedAt.getTime();
    const dateB = b.updatedAt.getTime();
    return dateB - dateA; // Descending order (most recent first)
  });
}

/**
 * Sorts notes by createdAt in descending order (most recent first)
 * 
 * @param notes - Array of notes to sort
 * @returns New array of notes sorted by createdAt descending
 */
export function sortNotesByCreatedAt(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    const dateA = a.createdAt.getTime();
    const dateB = b.createdAt.getTime();
    return dateB - dateA; // Descending order (most recent first)
  });
}

/**
 * Sorts notes by title alphabetically (A-Z)
 * 
 * @param notes - Array of notes to sort
 * @returns New array of notes sorted by title ascending
 */
export function sortNotesByTitle(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    return a.title.localeCompare(b.title);
  });
}
