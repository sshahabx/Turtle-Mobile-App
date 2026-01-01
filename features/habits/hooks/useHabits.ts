/**
 * useHabits Hook
 * 
 * Manages habit data with proper separation between:
 * - Authenticated users: Data from backend API
 * - Offline users: Data from local AsyncStorage
 * 
 * Features optimistic updates for instant UI feedback.
 * 
 * Requirements:
 * - 4.2: Create habit reminder notifications for incomplete habits
 * - 6.1: Award points for completing a habit for the day (Career Journey - auth only)
 * - 7.1: Schedule habit reminder notifications for configurable time
 * - 7.3: Cancel scheduled notifications when item is completed or deleted
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Habit } from '../../../types';
import * as db from '../../../services/database';
import { habitsService } from '../../../services/api/services';
import { useAuth } from '../../auth/hooks/useAuth';
import { pointsService } from '../../journey/services/pointsService';

// Import notification functions with fallback for bundler issues
let scheduleHabitReminder: ((habit: Habit) => Promise<string | null>) | undefined;
let cancelScheduledNotificationForItem: ((type: 'habit' | 'task', itemId: string) => Promise<boolean>) | undefined;

try {
  const notificationService = require('../../../services/notifications/notificationService');
  scheduleHabitReminder = notificationService.scheduleHabitReminder;
  cancelScheduledNotificationForItem = notificationService.cancelScheduledNotificationForItem;
} catch (e) {
  console.warn('Notification service not available:', e);
}

const HABITS_KEY = ['habits'];

export const useHabits = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, isOfflineMode } = useAuth();

  // Determine if we should use local storage or API
  const useLocalStorage = !isAuthenticated || isOfflineMode;
  
  // Journey features are only available for authenticated users (not offline mode)
  const journeyEnabled = isAuthenticated && !isOfflineMode;
  
  // Get the current query key
  const queryKey = [...HABITS_KEY, useLocalStorage ? 'local' : 'api'];

  const {
    data: habits = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (useLocalStorage) {
        return db.getHabits();
      }
      return habitsService.getHabits();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: { name: string; description?: string; targetDays?: number }) => {
      if (useLocalStorage) {
        return db.createHabit(input);
      }
      return habitsService.createHabit(input);
    },
    onSuccess: async (createdHabit) => {
      if (scheduleHabitReminder) {
        try {
          await scheduleHabitReminder(createdHabit);
        } catch (e) {
          console.warn('Failed to schedule habit reminder:', e);
        }
      }
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Habit>) => {
      if (useLocalStorage) {
        return db.updateHabit(id, data);
      }
      return habitsService.updateHabit(id, data);
    },
    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousHabits = queryClient.getQueryData<Habit[]>(queryKey);
      
      if (previousHabits) {
        queryClient.setQueryData<Habit[]>(queryKey, 
          previousHabits.map(habit => 
            habit.id === variables.id 
              ? { ...habit, ...variables, updatedAt: new Date() }
              : habit
          )
        );
      }
      
      return { previousHabits };
    },
    onError: (err, variables, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(queryKey, context.previousHabits);
      }
      console.error('Update habit error:', err);
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
      queryClient.invalidateQueries({ queryKey: ['habit', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (cancelScheduledNotificationForItem) {
        try {
          await cancelScheduledNotificationForItem('habit', id);
        } catch (e) {
          console.warn('Failed to cancel scheduled notification:', e);
        }
      }
      
      if (useLocalStorage) {
        const result = await db.deleteHabit(id);
        if (!result) {
          throw new Error('Failed to delete habit from local storage');
        }
        return;
      }
      await habitsService.deleteHabit(id);
    },
    // Optimistic update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousHabits = queryClient.getQueryData<Habit[]>(queryKey);
      
      if (previousHabits) {
        queryClient.setQueryData<Habit[]>(queryKey, 
          previousHabits.filter(habit => habit.id !== id)
        );
      }
      
      return { previousHabits };
    },
    onError: (err, _id, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(queryKey, context.previousHabits);
      }
      console.error('Delete habit error:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      if (useLocalStorage) {
        return db.completeHabit(id);
      }
      return habitsService.completeHabit(id);
    },
    // Optimistic update for instant feedback
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousHabits = queryClient.getQueryData<Habit[]>(queryKey);
      
      // Optimistically update the habit as completed
      if (previousHabits) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        queryClient.setQueryData<Habit[]>(queryKey, 
          previousHabits.map(habit => {
            if (habit.id === id) {
              // Calculate new streak
              let newStreak = 1;
              if (habit.lastCompleted) {
                const lastDate = new Date(habit.lastCompleted);
                lastDate.setHours(0, 0, 0, 0);
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastDate.getTime() === yesterday.getTime()) {
                  newStreak = habit.currentStreak + 1;
                }
              }
              
              return {
                ...habit,
                currentStreak: newStreak,
                bestStreak: Math.max(habit.bestStreak, newStreak),
                lastCompleted: today,
                updatedAt: new Date(),
              };
            }
            return habit;
          })
        );
      }
      
      // Also update the individual habit query if it exists
      const previousHabit = queryClient.getQueryData<Habit>(['habit', id, useLocalStorage ? 'local' : 'api']);
      if (previousHabit) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let newStreak = 1;
        if (previousHabit.lastCompleted) {
          const lastDate = new Date(previousHabit.lastCompleted);
          lastDate.setHours(0, 0, 0, 0);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastDate.getTime() === yesterday.getTime()) {
            newStreak = previousHabit.currentStreak + 1;
          }
        }
        
        queryClient.setQueryData(['habit', id, useLocalStorage ? 'local' : 'api'], {
          ...previousHabit,
          currentStreak: newStreak,
          bestStreak: Math.max(previousHabit.bestStreak, newStreak),
          lastCompleted: today,
          updatedAt: new Date(),
        });
      }
      
      return { previousHabits, previousHabit };
    },
    onError: (err, id, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(queryKey, context.previousHabits);
      }
      if (context?.previousHabit) {
        queryClient.setQueryData(['habit', id, useLocalStorage ? 'local' : 'api'], context.previousHabit);
      }
      console.error('Complete habit error:', err);
    },
    onSuccess: async (completedHabit) => {
      if (completedHabit) {
        if (cancelScheduledNotificationForItem) {
          try {
            await cancelScheduledNotificationForItem('habit', completedHabit.id);
          } catch (e) {
            console.warn('Failed to cancel scheduled notification:', e);
          }
        }
        if (scheduleHabitReminder) {
          try {
            await scheduleHabitReminder(completedHabit);
          } catch (e) {
            console.warn('Failed to schedule habit reminder:', e);
          }
        }
        if (journeyEnabled) {
          pointsService.awardPoints('habit_completed');
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
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
    isCompleting: completeMutation.isPending,
  };
};

export const useHabit = (id: string | undefined) => {
  const { isAuthenticated, isOfflineMode } = useAuth();
  const useLocalStorage = !isAuthenticated || isOfflineMode;

  const { data: habit, isLoading, error, refetch } = useQuery({
    queryKey: ['habit', id, useLocalStorage ? 'local' : 'api'],
    queryFn: async () => {
      if (!id) return null;
      if (useLocalStorage) {
        return db.getHabit(id);
      }
      return habitsService.getHabit(id);
    },
    enabled: !!id,
  });
  return { habit, isLoading, error, refetch };
};

export default useHabits;
