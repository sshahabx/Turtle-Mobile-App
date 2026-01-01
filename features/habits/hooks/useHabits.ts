/**
 * useHabits Hook
 * 
 * Manages habit data with proper separation between:
 * - Authenticated users: Data from backend API
 * - Offline users: Data from local AsyncStorage
 * 
 * Requirements:
 * - 4.2: Create habit reminder notifications for incomplete habits
 * - 7.1: Schedule habit reminder notifications for configurable time
 * - 7.3: Cancel scheduled notifications when item is completed or deleted
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Habit } from '../../../types';
import * as db from '../../../services/database';
import { habitsService } from '../../../services/api/services';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  scheduleHabitReminder,
  cancelScheduledNotificationForItem,
} from '../../../services/notifications/notificationService';

const HABITS_KEY = ['habits'];

export const useHabits = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, isOfflineMode } = useAuth();

  // Determine if we should use local storage or API
  const useLocalStorage = !isAuthenticated || isOfflineMode;

  const {
    data: habits = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...HABITS_KEY, useLocalStorage ? 'local' : 'api'],
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
      // Schedule habit reminder notification (Requirements 4.2, 7.1)
      await scheduleHabitReminder(createdHabit);
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
      queryClient.invalidateQueries({ queryKey: ['habit', variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Cancel any scheduled notification before deleting (Requirement 7.3)
      await cancelScheduledNotificationForItem('habit', id);
      
      if (useLocalStorage) {
        return db.deleteHabit(id);
      }
      return habitsService.deleteHabit(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HABITS_KEY }),
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      if (useLocalStorage) {
        return db.completeHabit(id);
      }
      return habitsService.completeHabit(id);
    },
    onSuccess: async (completedHabit) => {
      // Cancel today's notification and reschedule for tomorrow (Requirements 7.1, 7.3)
      if (completedHabit) {
        await cancelScheduledNotificationForItem('habit', completedHabit.id);
        // Reschedule for the next day
        await scheduleHabitReminder(completedHabit);
      }
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