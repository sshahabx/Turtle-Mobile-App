/**
 * Notes Service
 * 
 * Provides note-related API operations with proper typing and date parsing.
 * Wraps the core API service for use within the notes feature.
 * 
 * Requirements:
 * - 8.1: Display notes sorted by last updated
 * - 8.3: Create note via API
 * - 8.5: Update note via API
 * - 8.6: Delete note via API
 */

import { notesService as apiNotesService } from '../../../services/api/services';
import { Note, NoteCreateInput, NoteUpdateInput } from '../../../types';

/**
 * Notes Service - Feature-level API for note operations
 */
export const notesService = {
  /**
   * Fetches all notes for the authenticated user
   * @returns Promise resolving to array of notes with parsed dates
   */
  async getNotes(): Promise<Note[]> {
    return apiNotesService.getNotes();
  },

  /**
   * Fetches a single note by ID
   * @param id - The note ID to fetch
   * @returns Promise resolving to the note with parsed dates
   */
  async getNote(id: string): Promise<Note> {
    return apiNotesService.getNote(id);
  },

  /**
   * Creates a new note
   * @param data - The note creation input
   * @returns Promise resolving to the created note with parsed dates
   */
  async createNote(data: NoteCreateInput): Promise<Note> {
    return apiNotesService.createNote(data);
  },

  /**
   * Updates an existing note
   * @param id - The note ID to update
   * @param data - The note update input
   * @returns Promise resolving to the updated note with parsed dates
   */
  async updateNote(id: string, data: NoteUpdateInput): Promise<Note> {
    return apiNotesService.updateNote(id, data);
  },

  /**
   * Deletes a note
   * @param id - The note ID to delete
   * @returns Promise resolving when deletion is complete
   */
  async deleteNote(id: string): Promise<void> {
    return apiNotesService.deleteNote(id);
  },
};

export default notesService;
