/**
 * useNotes Hook
 * 
 * Manages note data with proper separation between:
 * - Authenticated users: Data from backend API
 * - Offline users: Data from local AsyncStorage
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '../../../types';
import * as db from '../../../services/database';
import { notesService } from '../../../services/api/services';
import { useAuth } from '../../auth/hooks/useAuth';

const NOTES_KEY = ['notes'];

export const useNotes = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, isOfflineMode } = useAuth();

  // Determine if we should use local storage or API
  const useLocalStorage = !isAuthenticated || isOfflineMode;

  const {
    data: notes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...NOTES_KEY, useLocalStorage ? 'local' : 'api'],
    queryFn: async () => {
      if (useLocalStorage) {
        return db.getNotes();
      }
      return notesService.getNotes();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: { title: string; content: string }) => {
      if (useLocalStorage) {
        return db.createNote(input);
      }
      return notesService.createNote(input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTES_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Note>) => {
      if (useLocalStorage) {
        return db.updateNote(id, data);
      }
      return notesService.updateNote(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
      queryClient.invalidateQueries({ queryKey: ['note', variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (useLocalStorage) {
        return db.deleteNote(id);
      }
      return notesService.deleteNote(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTES_KEY }),
  });

  return {
    notes,
    isLoading,
    error,
    refetch,
    createNote: createMutation.mutateAsync,
    updateNote: updateMutation.mutateAsync,
    deleteNote: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useNote = (id: string | undefined) => {
  const { isAuthenticated, isOfflineMode } = useAuth();
  const useLocalStorage = !isAuthenticated || isOfflineMode;

  const { data: note, isLoading, error, refetch } = useQuery({
    queryKey: ['note', id, useLocalStorage ? 'local' : 'api'],
    queryFn: async () => {
      if (!id) return null;
      if (useLocalStorage) {
        return db.getNote(id);
      }
      return notesService.getNote(id);
    },
    enabled: !!id,
  });
  return { note, isLoading, error, refetch };
};

export default useNotes;