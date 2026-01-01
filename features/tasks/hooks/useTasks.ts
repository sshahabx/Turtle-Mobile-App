/**
 * useTasks Hook
 * 
 * Manages task data with proper separation between:
 * - Authenticated users: Data from backend API
 * - Offline users: Data from local AsyncStorage
 * 
 * Requirements:
 * - 4.3: Create task due date reminder notifications (within 24 hours)
 * - 4.4: Create task overdue notifications
 * - 7.2: Schedule task due date reminders 24 hours before due date
 * - 7.3: Cancel scheduled notifications when item is completed or deleted
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '../../../types';
import * as db from '../../../services/database';
import { tasksService } from '../../../services/api/services';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  scheduleTaskReminder,
  cancelScheduledNotificationForItem,
} from '../../../services/notifications/notificationService';

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
    onSuccess: async (createdTask) => {
      // Schedule task due date reminder if task has a due date (Requirements 4.3, 7.2)
      if (createdTask.dueDate) {
        await scheduleTaskReminder(createdTask);
      }
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Task>) => {
      if (useLocalStorage) {
        return db.updateTask(id, data);
      }
      return tasksService.updateTask(id, data);
    },
    onSuccess: async (updatedTask, variables) => {
      // Handle notification scheduling based on due date changes (Requirements 4.3, 7.2, 7.3)
      if (updatedTask) {
        if (updatedTask.dueDate) {
          // Cancel existing and schedule new reminder if due date changed
          await cancelScheduledNotificationForItem('task', variables.id);
          await scheduleTaskReminder(updatedTask);
        } else if (variables.dueDate === null) {
          // Due date was removed, cancel any scheduled notification
          await cancelScheduledNotificationForItem('task', variables.id);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Cancel any scheduled notification before deleting (Requirement 7.3)
      await cancelScheduledNotificationForItem('task', id);
      
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
    onSuccess: async (updatedTask) => {
      // Cancel notification when task is completed (Requirement 7.3)
      if (updatedTask && updatedTask.status === 'COMPLETED') {
        await cancelScheduledNotificationForItem('task', updatedTask.id);
      } else if (updatedTask && updatedTask.status === 'PENDING' && updatedTask.dueDate) {
        // Re-schedule notification if task is marked as pending again
        await scheduleTaskReminder(updatedTask);
      }
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
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