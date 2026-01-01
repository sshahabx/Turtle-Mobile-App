/**
 * useNotes Hook
 * 
 * Manages note data with proper separation between:
 * - Authenticated users: Data from backend API
 * - Offline users: Data from local AsyncStorage
 * 
 * Features optimistic updates for instant UI feedback.
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
  
  // Get the current query key
  const queryKey = [...NOTES_KEY, useLocalStorage ? 'local' : 'api'];

  const {
    data: notes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
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
    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousNotes = queryClient.getQueryData<Note[]>(queryKey);
      
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(queryKey, 
          previousNotes.map(note => 
            note.id === variables.id 
              ? { ...note, ...variables, updatedAt: new Date() }
              : note
          )
        );
      }
      
      // Also update the individual note query
      const previousNote = queryClient.getQueryData<Note>(['note', variables.id, useLocalStorage ? 'local' : 'api']);
      if (previousNote) {
        queryClient.setQueryData(['note', variables.id, useLocalStorage ? 'local' : 'api'], {
          ...previousNote,
          ...variables,
          updatedAt: new Date(),
        });
      }
      
      return { previousNotes, previousNote };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKey, context.previousNotes);
      }
      if (context?.previousNote) {
        queryClient.setQueryData(['note', variables.id, useLocalStorage ? 'local' : 'api'], context.previousNote);
      }
      console.error('Update note error:', err);
    },
    onSettled: (_, __, variables) => {
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
    // Optimistic update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousNotes = queryClient.getQueryData<Note[]>(queryKey);
      
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(queryKey, 
          previousNotes.filter(note => note.id !== id)
        );
      }
      
      return { previousNotes };
    },
    onError: (err, id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKey, context.previousNotes);
      }
      console.error('Delete note error:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
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
