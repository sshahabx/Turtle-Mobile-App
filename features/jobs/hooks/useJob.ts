/**
 * useJob Hook
 * 
 * Fetches a single job by ID.
 * Uses API for authenticated users, local storage for offline users.
 */

import { useQuery } from '@tanstack/react-query';
import * as db from '../../../services/database';
import { jobsService } from '../services/jobsService';
import { useAuth } from '../../auth/hooks/useAuth';

export const useJob = (id: string | undefined) => {
  const { isAuthenticated, isOfflineMode } = useAuth();
  const useLocalStorage = !isAuthenticated || isOfflineMode;

  const {
    data: job,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['job', id, useLocalStorage ? 'local' : 'api'],
    queryFn: async () => {
      if (!id) return null;
      if (useLocalStorage) {
        return db.getJob(id);
      }
      return jobsService.getJob(id);
    },
    enabled: !!id,
  });

  return {
    job,
    isLoading,
    error,
    refetch,
  };
};

export default useJob;
