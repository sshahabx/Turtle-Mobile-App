/**
 * useTasks Hook - Local Database Version
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '../../../types';
import * as db from '../../../services/database';

const TASKS_KEY = ['tasks'];

export const useTasks = () => {
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: TASKS_KEY,
    queryFn: db.getTasks,
  });

  const createMutation = useMutation({
    mutationFn: (input: { title: string; description?: string; dueDate?: Date }) => 
      db.createTask(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Task>) => db.updateTask(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => db.deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => db.toggleTaskStatus(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });

  return {
    tasks,
    isLoading,
    error,
    refetch,
    createTask: createMutation.mutateAsync,
    updateTask: updateMutation.mutateAsync,
    deleteTask: deleteMutation.mutateAsync,
    toggleTask: toggleMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useTask = (id: string | undefined) => {
  const { data: task, isLoading, error, refetch } = useQuery({
    queryKey: ['task', id],
    queryFn: () => (id ? db.getTask(id) : null),
    enabled: !!id,
  });
  return { task, isLoading, error, refetch };
};

export default useTasks;
