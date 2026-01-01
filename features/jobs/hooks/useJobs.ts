/**
 * useJobs Hook
 * 
 * Manages job data with proper separation between:
 * - Authenticated users: Data from backend API
 * - Offline users: Data from local AsyncStorage
 * 
 * Requirements:
 * - 3.2: Complete current level and create new level when job is accepted (Career Journey - auth only)
 * - 4.1: Create job status change notifications with job title, company, and new status
 * - 4.2: Unlock milestones when corresponding activity is completed (Career Journey - auth only)
 * - 4.3: Unlock milestones with subtle animation when achieved (Career Journey - auth only)
 * - 6.1: Award points for adding a new job application (Career Journey - auth only)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Job, JobStatus, JobCreateInput, JobUpdateInput } from '../../../types';
import type { JourneyStats } from '../../../types/journey';
import * as db from '../../../services/database';
import { jobsService } from '../services/jobsService';
import { useAuth } from '../../auth/hooks/useAuth';
import { createJobStatusNotification } from '../../../services/notifications/notificationService';
import { pointsService } from '../../journey/services/pointsService';
import { journeyService } from '../../journey/services/journeyService';

const JOBS_KEY = ['jobs'];

/**
 * Calculates journey statistics from jobs data for milestone checks
 */
function calculateJourneyStats(jobs: Job[]): JourneyStats {
  return {
    totalApplications: jobs.length,
    totalInterviews: jobs.filter(
      (job) =>
        job.status === JobStatus.INTERVIEWING ||
        job.status === JobStatus.OFFERED ||
        job.status === JobStatus.ACCEPTED
    ).length,
    totalOffers: jobs.filter(
      (job) =>
        job.status === JobStatus.OFFERED || job.status === JobStatus.ACCEPTED
    ).length,
    acceptedJobs: jobs.filter((job) => job.status === JobStatus.ACCEPTED).length,
  };
}

/**
 * Checks and unlocks milestones based on current job stats
 * Only runs for authenticated users
 */
async function checkAndUnlockMilestones(jobs: Job[]): Promise<void> {
  try {
    const stats = calculateJourneyStats(jobs);
    await journeyService.checkAndUnlockMilestones(stats);
  } catch (error) {
    console.error('Failed to check milestones:', error);
  }
}

export const useJobs = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, isOfflineMode } = useAuth();

  // Determine if we should use local storage or API
  const useLocalStorage = !isAuthenticated || isOfflineMode;
  
  // Journey features are only available for authenticated users (not offline mode)
  const journeyEnabled = isAuthenticated && !isOfflineMode;

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
    onSuccess: async (createdJob) => {
      // Invalidate queries first to get updated job list
      await queryClient.invalidateQueries({ queryKey: JOBS_KEY });
      
      // Journey features only for authenticated users (Requirement 6.1, 4.2, 4.3)
      if (journeyEnabled) {
        // Award points for adding a new job application
        pointsService.awardPoints('job_added');
        
        // Check and unlock milestones after job creation
        const updatedJobs = queryClient.getQueryData<Job[]>([...JOBS_KEY, 'api']) ?? [];
        const allJobs = updatedJobs.some(j => j.id === createdJob.id) 
          ? updatedJobs 
          : [...updatedJobs, createdJob];
        await checkAndUnlockMilestones(allJobs);
      }
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
    onSuccess: async (updatedJob, variables) => {
      // Trigger job status change notification if status was updated (Requirement 4.1)
      if (variables.status) {
        createJobStatusNotification(updatedJob, variables.status);
        
        // Journey features only for authenticated users (Requirement 3.2)
        if (journeyEnabled && variables.status === JobStatus.ACCEPTED) {
          try {
            await journeyService.completeLevel(updatedJob.id);
          } catch (error) {
            console.error('Failed to complete journey level:', error);
          }
        }
      }
      
      // Invalidate queries first
      await queryClient.invalidateQueries({ queryKey: JOBS_KEY });
      await queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
      
      // Check and unlock milestones after status change (Requirements 4.2, 4.3) - auth only
      if (journeyEnabled && variables.status) {
        const updatedJobs = queryClient.getQueryData<Job[]>([...JOBS_KEY, 'api']) ?? [];
        const allJobs = updatedJobs.map(j => j.id === updatedJob.id ? updatedJob : j);
        await checkAndUnlockMilestones(allJobs);
      }
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
    onSuccess: async (updatedJob, variables) => {
      // Trigger job status change notification (Requirement 4.1)
      createJobStatusNotification(updatedJob, variables.status);
      
      // Journey features only for authenticated users (Requirement 3.2)
      if (journeyEnabled && variables.status === JobStatus.ACCEPTED) {
        try {
          await journeyService.completeLevel(updatedJob.id);
        } catch (error) {
          console.error('Failed to complete journey level:', error);
        }
      }
      
      // Invalidate queries first
      await queryClient.invalidateQueries({ queryKey: JOBS_KEY });
      await queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
      
      // Check and unlock milestones after status change (Requirements 4.2, 4.3) - auth only
      if (journeyEnabled) {
        const updatedJobs = queryClient.getQueryData<Job[]>([...JOBS_KEY, 'api']) ?? [];
        const allJobs = updatedJobs.map(j => j.id === updatedJob.id ? updatedJob : j);
        await checkAndUnlockMilestones(allJobs);
      }
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
