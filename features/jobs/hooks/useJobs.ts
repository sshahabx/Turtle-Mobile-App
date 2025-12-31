/**
 * useJobs Hook - Local Database Version
 * 
 * Manages job data using local AsyncStorage.
 * No backend API required.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Job, JobStatus } from '../../../types';
import * as db from '../../../services/database';

const JOBS_KEY = ['jobs'];

export const useJobs = () => {
  const queryClient = useQueryClient();

  // Fetch all jobs
  const {
    data: jobs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: JOBS_KEY,
    queryFn: db.getJobs,
  });

  // Create job mutation
  const createMutation = useMutation({
    mutationFn: (input: {
      title: string;
      company: string;
      status?: JobStatus;
      platform?: string;
      deadline?: Date;
      notes?: string;
    }) => db.createJob(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
    },
  });

  // Update job mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Job>) => 
      db.updateJob(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both the jobs list and the individual job query
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
      queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
    },
  });

  // Delete job mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => db.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) =>
      db.updateJob(id, { status }),
    onSuccess: (_, variables) => {
      // Invalidate both the jobs list and the individual job query
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
