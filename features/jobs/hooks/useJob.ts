/**
 * useJob Hook - Local Database Version
 * 
 * Fetches a single job by ID from local storage.
 */

import { useQuery } from '@tanstack/react-query';
import * as db from '../../../services/database';

export const useJob = (id: string | undefined) => {
  const {
    data: job,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['job', id],
    queryFn: () => (id ? db.getJob(id) : null),
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
