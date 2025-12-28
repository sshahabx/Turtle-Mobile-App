/**
 * useGoalAchievement Hook
 *
 * Tracks when the daily goal is achieved and manages the celebration notification.
 *
 * Requirements:
 * - 6.4: Display celebratory notification when DailyGoal is reached
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Job } from '../../../types';
import { getJobsCreatedToday } from '../../jobs/utils/jobUtils';

export interface UseGoalAchievementReturn {
  /** Whether the goal achievement notification should be shown */
  showCelebration: boolean;
  /** Dismiss the celebration notification */
  dismissCelebration: () => void;
  /** Check if goal was just achieved (for manual triggering) */
  checkGoalAchievement: (jobs: Job[], dailyGoal: number) => void;
}

/**
 * Hook for tracking goal achievement and showing celebration
 */
export function useGoalAchievement(
  jobs: Job[],
  dailyGoal: number
): UseGoalAchievementReturn {
  const [showCelebration, setShowCelebration] = useState(false);
  const previousCountRef = useRef<number | null>(null);
  const hasShownCelebrationRef = useRef(false);

  // Get current count of jobs created today
  const todaysJobs = getJobsCreatedToday(jobs);
  const currentCount = todaysJobs.length;

  // Check if goal was just achieved
  useEffect(() => {
    // Skip if we've already shown celebration today
    if (hasShownCelebrationRef.current) {
      return;
    }

    // Skip on initial load (previousCount is null)
    if (previousCountRef.current === null) {
      previousCountRef.current = currentCount;
      // If already at or above goal on load, mark as shown to prevent showing on refresh
      if (currentCount >= dailyGoal) {
        hasShownCelebrationRef.current = true;
      }
      return;
    }

    // Check if we just crossed the goal threshold
    const wasBeforeGoal = previousCountRef.current < dailyGoal;
    const isAtOrAboveGoal = currentCount >= dailyGoal;

    if (wasBeforeGoal && isAtOrAboveGoal) {
      setShowCelebration(true);
      hasShownCelebrationRef.current = true;
    }

    previousCountRef.current = currentCount;
  }, [currentCount, dailyGoal]);

  // Reset the celebration shown flag at midnight (new day)
  useEffect(() => {
    const checkNewDay = () => {
      const now = new Date();
      // Reset at midnight
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        hasShownCelebrationRef.current = false;
        previousCountRef.current = null;
      }
    };

    // Check every minute
    const interval = setInterval(checkNewDay, 60000);
    return () => clearInterval(interval);
  }, []);

  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  const checkGoalAchievement = useCallback(
    (jobsList: Job[], goal: number) => {
      if (hasShownCelebrationRef.current) return;

      const todaysJobsList = getJobsCreatedToday(jobsList);
      if (todaysJobsList.length >= goal) {
        setShowCelebration(true);
        hasShownCelebrationRef.current = true;
      }
    },
    []
  );

  return {
    showCelebration,
    dismissCelebration,
    checkGoalAchievement,
  };
}

export default useGoalAchievement;
