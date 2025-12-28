/**
 * useNotes Hook - Local Database Version
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '../../../types';
import * as db from '../../../services/database';

const NOTES_KEY = ['notes'];

export const useNotes = () => {
  const queryClient = useQueryClient();

  const {
    data: notes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: NOTES_KEY,
    queryFn: db.getNotes,
  });

  const createMutation = useMutation({
    mutationFn: (input: { title: string; content: string }) => db.createNote(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTES_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Note>) => db.updateNote(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTES_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => db.deleteNote(id),
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
  const { data: note, isLoading, error, refetch } = useQuery({
    queryKey: ['note', id],
    queryFn: () => (id ? db.getNote(id) : null),
    enabled: !!id,
  });
  return { note, isLoading, error, refetch };
};

export default useNotes;
