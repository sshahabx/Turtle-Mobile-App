/**
 * useTasks Hook
 * 
 * Manages task data with proper separation between:
 * - Authenticated users: Data from backend API
 * - Offline users: Data from local AsyncStorage
 * 
 * Features optimistic updates for instant UI feedback.
 * 
 * Requirements:
 * - 4.3: Create task due date reminder notifications (within 24 hours)
 * - 4.4: Create task overdue notifications
 * - 6.1: Award points for completing a daily task (Career Journey - auth only)
 * - 7.2: Schedule task due date reminders 24 hours before due date
 * - 7.3: Cancel scheduled notifications when item is completed or deleted
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, TaskStatus } from '../../../types';
import * as db from '../../../services/database';
import { tasksService } from '../../../services/api/services';
import { useAuth } from '../../auth/hooks/useAuth';
import { pointsService } from '../../journey/services/pointsService';

// Import notification functions with fallback for bundler issues
let scheduleTaskReminder: ((task: Task) => Promise<string | null>) | undefined;
let cancelScheduledNotificationForItem: ((type: 'habit' | 'task', itemId: string) => Promise<boolean>) | undefined;

try {
  const notificationService = require('../../../services/notifications/notificationService');
  scheduleTaskReminder = notificationService.scheduleTaskReminder;
  cancelScheduledNotificationForItem = notificationService.cancelScheduledNotificationForItem;
} catch (e) {
  console.warn('Notification service not available:', e);
}

const TASKS_KEY = ['tasks'];

export const useTasks = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, isOfflineMode } = useAuth();

  // Determine if we should use local storage or API
  const useLocalStorage = !isAuthenticated || isOfflineMode;
  
  // Journey features are only available for authenticated users (not offline mode)
  const journeyEnabled = isAuthenticated && !isOfflineMode;
  
  // Get the current query key
  const queryKey = [...TASKS_KEY, useLocalStorage ? 'local' : 'api'];

  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
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
      if (createdTask.dueDate && scheduleTaskReminder) {
        try {
          await scheduleTaskReminder(createdTask);
        } catch (e) {
          console.warn('Failed to schedule task reminder:', e);
        }
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
    // Optimistic update
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);
      
      // Optimistically update the cache
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(queryKey, 
          previousTasks.map(task => 
            task.id === variables.id 
              ? { ...task, ...variables, updatedAt: new Date() }
              : task
          )
        );
      }
      
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
      console.error('Update task error:', err);
    },
    onSuccess: async (updatedTask, variables) => {
      // Handle notification scheduling based on due date changes
      if (updatedTask) {
        if (updatedTask.dueDate) {
          if (cancelScheduledNotificationForItem) {
            try {
              await cancelScheduledNotificationForItem('task', variables.id);
            } catch (e) {
              console.warn('Failed to cancel scheduled notification:', e);
            }
          }
          if (scheduleTaskReminder) {
            try {
              await scheduleTaskReminder(updatedTask);
            } catch (e) {
              console.warn('Failed to schedule task reminder:', e);
            }
          }
        } else if (variables.dueDate === null) {
          if (cancelScheduledNotificationForItem) {
            try {
              await cancelScheduledNotificationForItem('task', variables.id);
            } catch (e) {
              console.warn('Failed to cancel scheduled notification:', e);
            }
          }
        }
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (cancelScheduledNotificationForItem) {
        try {
          await cancelScheduledNotificationForItem('task', id);
        } catch (e) {
          console.warn('Failed to cancel scheduled notification:', e);
        }
      }
      
      if (useLocalStorage) {
        return db.deleteTask(id);
      }
      return tasksService.deleteTask(id);
    },
    // Optimistic update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);
      
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(queryKey, 
          previousTasks.filter(task => task.id !== id)
        );
      }
      
      return { previousTasks };
    },
    onError: (err, id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
      console.error('Delete task error:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      if (useLocalStorage) {
        return db.toggleTaskStatus(id);
      }
      // For API, we need to get the current status from cache first
      const currentTasks = queryClient.getQueryData<Task[]>(queryKey);
      const task = currentTasks?.find(t => t.id === id);
      const newStatus = task?.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      return tasksService.updateTask(id, { status: newStatus as TaskStatus });
    },
    // Optimistic update for instant feedback
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);
      
      // Optimistically update the cache
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(queryKey, 
          previousTasks.map(task => {
            if (task.id === id) {
              const newStatus = task.status === TaskStatus.COMPLETED 
                ? TaskStatus.PENDING 
                : TaskStatus.COMPLETED;
              return { ...task, status: newStatus, updatedAt: new Date() };
            }
            return task;
          })
        );
      }
      
      // Also update the individual task query if it exists
      const previousTask = queryClient.getQueryData<Task>(['task', id, useLocalStorage ? 'local' : 'api']);
      if (previousTask) {
        const newStatus = previousTask.status === TaskStatus.COMPLETED 
          ? TaskStatus.PENDING 
          : TaskStatus.COMPLETED;
        queryClient.setQueryData(['task', id, useLocalStorage ? 'local' : 'api'], {
          ...previousTask,
          status: newStatus,
          updatedAt: new Date(),
        });
      }
      
      return { previousTasks, previousTask };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(['task', id, useLocalStorage ? 'local' : 'api'], context.previousTask);
      }
      console.error('Toggle task error:', err);
    },
    onSuccess: async (updatedTask) => {
      if (updatedTask && updatedTask.status === 'COMPLETED') {
        if (cancelScheduledNotificationForItem) {
          try {
            await cancelScheduledNotificationForItem('task', updatedTask.id);
          } catch (e) {
            console.warn('Failed to cancel scheduled notification:', e);
          }
        }
        if (journeyEnabled) {
          pointsService.awardPoints('task_completed');
        }
      } else if (updatedTask && updatedTask.status === 'PENDING' && updatedTask.dueDate) {
        if (scheduleTaskReminder) {
          try {
            await scheduleTaskReminder(updatedTask);
          } catch (e) {
            console.warn('Failed to schedule task reminder:', e);
          }
        }
      }
    },
    onSettled: () => {
      // Refetch to ensure cache is in sync with server
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
    isToggling: toggleMutation.isPending,
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
