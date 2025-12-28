/**
 * Jobs Service
 * 
 * Provides job-related API operations with proper typing and date parsing.
 * Wraps the core API service for use within the jobs feature.
 * 
 * Requirements:
 * - 2.1: Display job applications grouped by status
 * - 3.2: Create job via API with optimistic update
 * - 4.4: Update job via API with optimistic update
 * - 4.6: Delete job via API with optimistic update
 */

import { jobsService as apiJobsService } from '../../../services/api/services';
import { Job, JobCreateInput, JobUpdateInput, JobStatus } from '../../../types';

/**
 * Extended job response that includes goal information
 * Used when creating a job to track daily progress
 */
export interface JobWithGoalInfo extends Job {
  goalInfo?: {
    todaysCount: number;
    dailyGoal: number;
    goalReached: boolean;
  };
}

/**
 * Jobs grouped by status for dashboard display
 */
export type JobsByStatus = {
  [K in JobStatus]: Job[];
};

/**
 * Jobs Service - Feature-level API for job operations
 */
export const jobsService = {
  /**
   * Fetches all jobs for the authenticated user
   * @returns Promise resolving to array of jobs with parsed dates
   */
  async getJobs(): Promise<Job[]> {
    return apiJobsService.getJobs();
  },

  /**
   * Fetches a single job by ID
   * @param id - The job ID to fetch
   * @returns Promise resolving to the job with parsed dates
   */
  async getJob(id: string): Promise<Job> {
    return apiJobsService.getJob(id);
  },

  /**
   * Creates a new job application
   * @param data - The job creation input
   * @returns Promise resolving to the created job with parsed dates
   */
  async createJob(data: JobCreateInput): Promise<Job> {
    return apiJobsService.createJob(data);
  },

  /**
   * Updates an existing job
   * @param id - The job ID to update
   * @param data - The job update input
   * @returns Promise resolving to the updated job with parsed dates
   */
  async updateJob(id: string, data: JobUpdateInput): Promise<Job> {
    return apiJobsService.updateJob(id, data);
  },

  /**
   * Deletes a job
   * @param id - The job ID to delete
   * @returns Promise resolving when deletion is complete
   */
  async deleteJob(id: string): Promise<void> {
    return apiJobsService.deleteJob(id);
  },
};

export default jobsService;
