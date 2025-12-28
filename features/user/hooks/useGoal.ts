/**
 * useGoal Hook - Local Database Version
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as db from '../../../services/database';

const SETTINGS_KEY = ['userSettings'];
const JOBS_KEY = ['jobs'];

// Validate goal value (1-50)
export const validateGoal = (goal: number): { valid: boolean; error?: string } => {
  if (isNaN(goal) || !Number.isInteger(goal)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  if (goal < 1) {
    return { valid: false, error: 'Goal must be at least 1' };
  }
  if (goal > 50) {
    return { valid: false, error: 'Goal cannot exceed 50' };
  }
  return { valid: true };
};

export interface UseGoalReturn {
  dailyGoal: number;
  todayCount: number;
  progress: number;
  goalReached: boolean;
  updateGoal: (goal: number) => Promise<unknown>;
  isUpdating: boolean;
  refetch: () => void;
}

export const useGoal = (): UseGoalReturn => {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: db.getUserSettings,
  });

  const { data: stats } = useQuery({
    queryKey: ['jobStats'],
    queryFn: db.getJobStats,
  });

  const updateGoalMutation = useMutation({
    mutationFn: (goal: number) => db.updateUserSettings({ dailyJobGoal: goal }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
  });

  const dailyGoal = settings?.dailyJobGoal ?? 5;
  const todayCount = stats?.todayCount ?? 0;
  const progress = Math.min((todayCount / dailyGoal) * 100, 100);
  const goalReached = todayCount >= dailyGoal;

  return {
    dailyGoal,
    todayCount,
    progress,
    goalReached,
    updateGoal: updateGoalMutation.mutateAsync,
    isUpdating: updateGoalMutation.isPending,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
      queryClient.invalidateQueries({ queryKey: ['jobStats'] });
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
    },
  };
};

export default useGoal;
