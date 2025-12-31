/**
 * useTasks Hook
 * 
 * Manages task data with proper separation between:
 * - Authenticated users: Data from backend API
 * - Offline users: Data from local AsyncStorage
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '../../../types';
import * as db from '../../../services/database';
import { tasksService } from '../../../services/api/services';
import { useAuth } from '../../auth/hooks/useAuth';

const TASKS_KEY = ['tasks'];

export const useTasks = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, isOfflineMode } = useAuth();

  // Determine if we should use local storage or API
  const useLocalStorage = !isAuthenticated || isOfflineMode;

  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...TASKS_KEY, useLocalStorage ? 'local' : 'api'],
    queryFn: async () => {
      if (useLocalStorage) {
        return db.getTasks();
      }
      return tasksService.getTasks();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: { title: string; description?: string; dueDate?: Date }) => {
      if (useLocalStorage) {
        return db.createTask(input);
      }
      return tasksService.createTask(input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Task>) => {
      if (useLocalStorage) {
        return db.updateTask(id, data);
      }
      return tasksService.updateTask(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (useLocalStorage) {
        return db.deleteTask(id);
      }
      return tasksService.deleteTask(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      if (useLocalStorage) {
        return db.toggleTaskStatus(id);
      }
      // For API, we need to get the task first and toggle its status
      const task = await tasksService.getTask(id);
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      return tasksService.updateTask(id, { status: newStatus as import('../../../types').TaskStatus });
    },
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
  const { isAuthenticated, isOfflineMode } = useAuth();
  const useLocalStorage = !isAuthenticated || isOfflineMode;

  const { data: task, isLoading, error, refetch } = useQuery({
    queryKey: ['task', id, useLocalStorage ? 'local' : 'api'],
    queryFn: async () => {
      if (!id) return null;
      if (useLocalStorage) {
        return db.getTask(id);
      }
      return tasksService.getTask(id);
    },
    enabled: !!id,
  });
  return { task, isLoading, error, refetch };
};

export default useTasks;