/**
 * useLimits Hook
 * 
 * Provides limit checking functionality for Free Tier users.
 * Premium (authenticated) users have unlimited access.
 * 
 * @see Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { FREE_TIER_LIMITS, EntityType, LimitStatus } from '../config/limits';
import * as db from '../services/database';

export interface UseLimitsReturn extends LimitStatus {
  /** Whether user is in free tier */
  isFreeTier: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Refresh limit status */
  refresh: () => void;
}

/**
 * Get the current count of entities from the local database
 */
async function getEntityCount(entityType: EntityType): Promise<number> {
  switch (entityType) {
    case 'jobs': {
      const jobs = await db.getJobs();
      return jobs.length;
    }
    case 'notes': {
      const notes = await db.getNotes();
      return notes.length;
    }
    case 'tasks': {
      const tasks = await db.getTasks();
      return tasks.length;
    }
    case 'habits': {
      const habits = await db.getHabits();
      return habits.length;
    }
    default:
      return 0;
  }
}

/**
 * Calculate usage percentage, clamped between 0 and 100
 */
function calculateUsagePercentage(current: number, max: number): number {
  if (max <= 0 || !isFinite(max)) return 0;
  const percentage = Math.round((current / max) * 100);
  return Math.max(0, Math.min(100, percentage));
}

/**
 * Hook to check and manage entity limits based on user tier
 * 
 * @param entityType - The type of entity to check limits for
 * @returns Limit status including canCreate, currentCount, maxLimit, etc.
 */
export function useLimits(entityType: EntityType): UseLimitsReturn {
  const { isAuthenticated, isOfflineMode, isLoading: authLoading } = useAuth();
  const [currentCount, setCurrentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Determine if user is in free tier (offline mode and not authenticated)
  const isFreeTier = isOfflineMode && !isAuthenticated;
  
  // Get the max limit based on tier
  const maxLimit = isFreeTier ? FREE_TIER_LIMITS[entityType] : Infinity;
  
  // Calculate derived values
  const isAtLimit = isFreeTier && currentCount >= maxLimit;
  const canCreate = !isFreeTier || currentCount < maxLimit;
  const usagePercentage = calculateUsagePercentage(currentCount, maxLimit);

  // Fetch current count from database
  const fetchCount = useCallback(async () => {
    if (!isFreeTier) {
      // Premium users don't need count for limit checking
      setCurrentCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const count = await getEntityCount(entityType);
      setCurrentCount(count);
    } catch (error) {
      console.error(`Error fetching ${entityType} count:`, error);
      // On error, assume at limit for safety
      setCurrentCount(FREE_TIER_LIMITS[entityType]);
    } finally {
      setIsLoading(false);
    }
  }, [entityType, isFreeTier]);

  // Fetch count on mount and when dependencies change
  useEffect(() => {
    if (!authLoading) {
      fetchCount();
    }
  }, [fetchCount, authLoading]);

  // Refresh function for manual updates
  const refresh = useCallback(() => {
    fetchCount();
  }, [fetchCount]);

  return {
    canCreate,
    currentCount,
    maxLimit,
    usagePercentage,
    isAtLimit,
    isFreeTier,
    isLoading: isLoading || authLoading,
    refresh,
  };
}

export default useLimits;
