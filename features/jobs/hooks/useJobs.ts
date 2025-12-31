/**
 * useJobs Hook
 * 
 * Manages job data with proper separation between:
 * - Authenticated users: Data from backend API
 * - Offline users: Data from local AsyncStorage
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Job, JobStatus, JobCreateInput, JobUpdateInput } from '../../../types';
import * as db from '../../../services/database';
import { jobsService } from '../services/jobsService';
import { useAuth } from '../../auth/hooks/useAuth';

const JOBS_KEY = ['jobs'];

export const useJobs = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, isOfflineMode } = useAuth();

  // Determine if we should use local storage or API
  const useLocalStorage = !isAuthenticated || isOfflineMode;

  // Fetch all jobs - from API if authenticated, from local storage if offline
  const {
    data: jobs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...JOBS_KEY, useLocalStorage ? 'local' : 'api'],
    queryFn: async () => {
      if (useLocalStorage) {
        return db.getJobs();
      }
      return jobsService.getJobs();
    },
  });

  // Create job mutation
  const createMutation = useMutation({
    mutationFn: async (input: JobCreateInput) => {
      if (useLocalStorage) {
        return db.createJob(input);
      }
      return jobsService.createJob(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
    },
  });

  // Update job mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & JobUpdateInput) => {
      if (useLocalStorage) {
        const result = await db.updateJob(id, data);
        if (!result) throw new Error('Job not found');
        return result;
      }
      return jobsService.updateJob(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
      queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
    },
  });

  // Delete job mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (useLocalStorage) {
        const success = await db.deleteJob(id);
        if (!success) throw new Error('Job not found');
        return;
      }
      return jobsService.deleteJob(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: JobStatus }) => {
      if (useLocalStorage) {
        const result = await db.updateJob(id, { status });
        if (!result) throw new Error('Job not found');
        return result;
      }
      return jobsService.updateJob(id, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
      queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
    },
  });

  return {
    jobs,
    isLoading,
    error,
    refetch,
    createJob: createMutation.mutateAsync,
    updateJob: updateMutation.mutateAsync,
    deleteJob: deleteMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export default useJobs;
