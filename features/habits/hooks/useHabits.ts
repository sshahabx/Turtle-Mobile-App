/**
 * useHabits Hook - Local Database Version
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Habit } from '../../../types';
import * as db from '../../../services/database';

const HABITS_KEY = ['habits'];

export const useHabits = () => {
  const queryClient = useQueryClient();

  const {
    data: habits = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: HABITS_KEY,
    queryFn: db.getHabits,
  });

  const createMutation = useMutation({
    mutationFn: (input: { name: string; description?: string; targetDays?: number }) => 
      db.createHabit(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HABITS_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Habit>) => db.updateHabit(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HABITS_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => db.deleteHabit(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HABITS_KEY }),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => db.completeHabit(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HABITS_KEY }),
  });

  return {
    habits,
    isLoading,
    error,
    refetch,
    createHabit: createMutation.mutateAsync,
    updateHabit: updateMutation.mutateAsync,
    deleteHabit: deleteMutation.mutateAsync,
    completeHabit: completeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useHabit = (id: string | undefined) => {
  const { data: habit, isLoading, error, refetch } = useQuery({
    queryKey: ['habit', id],
    queryFn: () => (id ? db.getHabit(id) : null),
    enabled: !!id,
  });
  return { habit, isLoading, error, refetch };
};

export default useHabits;
