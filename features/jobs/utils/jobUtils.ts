/**
 * Job Utility Functions
 * 
 * Provides utility functions for job data manipulation including
 * grouping and sorting.
 * 
 * Requirements:
 * - 2.1: Display job applications grouped by status
 * - 2.2: Show count of applications in each status category
 * - 11.1: Provide sort options for date, title, company
 * - 11.2: Reorder list based on sort option
 */

import { Job, JobStatus } from '../../../types';

/**
 * Jobs grouped by status
 */
export type JobsByStatus = {
  [K in JobStatus]: Job[];
};

/**
 * Sort options for job list
 */
export type JobSortOption = 'date' | 'title' | 'company';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Groups jobs by their status
 * 
 * @param jobs - Array of jobs to group
 * @returns Object with jobs grouped by status
 * 
 * Property 3: Job grouping by status is accurate
 * - Each group contains exactly the jobs with that status
 * - The count for each group equals the length of that group
 */
export function groupJobsByStatus(jobs: Job[]): JobsByStatus {
  const grouped: JobsByStatus = {
    [JobStatus.PENDING]: [],
    [JobStatus.APPLIED]: [],
    [JobStatus.INTERVIEWING]: [],
    [JobStatus.OFFERED]: [],
    [JobStatus.ACCEPTED]: [],
    [JobStatus.REJECTED]: [],
  };

  for (const job of jobs) {
    if (job.status in grouped) {
      grouped[job.status].push(job);
    }
  }

  return grouped;
}

/**
 * Gets the count of jobs for each status
 * 
 * @param jobs - Array of jobs
 * @returns Object with count for each status
 */
export function getJobCountsByStatus(jobs: Job[]): Record<JobStatus, number> {
  const grouped = groupJobsByStatus(jobs);
  
  return {
    [JobStatus.PENDING]: grouped[JobStatus.PENDING].length,
    [JobStatus.APPLIED]: grouped[JobStatus.APPLIED].length,
    [JobStatus.INTERVIEWING]: grouped[JobStatus.INTERVIEWING].length,
    [JobStatus.OFFERED]: grouped[JobStatus.OFFERED].length,
    [JobStatus.ACCEPTED]: grouped[JobStatus.ACCEPTED].length,
    [JobStatus.REJECTED]: grouped[JobStatus.REJECTED].length,
  };
}

/**
 * Sorts jobs by the specified option
 * 
 * @param jobs - Array of jobs to sort
 * @param sortBy - Sort option (date, title, company)
 * @param direction - Sort direction (asc, desc), defaults to desc for date, asc for others
 * @returns Sorted array of jobs (new array, does not mutate input)
 * 
 * Property 21: Sort option changes list order
 * - Jobs are reordered according to the selected criterion
 */
export function sortJobs(
  jobs: Job[],
  sortBy: JobSortOption,
  direction?: SortDirection
): Job[] {
  const sortedJobs = [...jobs];
  
  // Default direction: desc for date, asc for title/company
  const sortDirection = direction ?? (sortBy === 'date' ? 'desc' : 'asc');
  const multiplier = sortDirection === 'asc' ? 1 : -1;

  sortedJobs.sort((a, b) => {
    switch (sortBy) {
      case 'date': {
        const dateA = a.createdAt.getTime();
        const dateB = b.createdAt.getTime();
        return (dateA - dateB) * multiplier;
      }
      case 'title': {
        return a.title.localeCompare(b.title) * multiplier;
      }
      case 'company': {
        return a.company.localeCompare(b.company) * multiplier;
      }
      default:
        return 0;
    }
  });

  return sortedJobs;
}

/**
 * Sorts jobs with ACCEPTED jobs appearing first
 * 
 * @param jobs - Array of jobs to sort
 * @param sortBy - Secondary sort option for non-accepted jobs
 * @param direction - Sort direction for secondary sort
 * @returns Sorted array with ACCEPTED jobs first
 * 
 * Property 5: Accepted jobs appear first
 * - ACCEPTED jobs appear before all other jobs in display order
 */
export function sortJobsWithAcceptedFirst(
  jobs: Job[],
  sortBy: JobSortOption = 'date',
  direction?: SortDirection
): Job[] {
  const acceptedJobs = jobs.filter((job) => job.status === JobStatus.ACCEPTED);
  const otherJobs = jobs.filter((job) => job.status !== JobStatus.ACCEPTED);

  const sortedAccepted = sortJobs(acceptedJobs, sortBy, direction);
  const sortedOthers = sortJobs(otherJobs, sortBy, direction);

  return [...sortedAccepted, ...sortedOthers];
}

/**
 * Gets jobs created today
 * 
 * @param jobs - Array of jobs
 * @returns Array of jobs created today
 */
export function getJobsCreatedToday(jobs: Job[]): Job[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return jobs.filter((job) => {
    const jobDate = new Date(job.createdAt);
    jobDate.setHours(0, 0, 0, 0);
    return jobDate.getTime() === today.getTime();
  });
}

/**
 * Checks if there is already an accepted job
 * 
 * @param jobs - Array of jobs
 * @returns The accepted job if one exists, undefined otherwise
 */
export function getAcceptedJob(jobs: Job[]): Job | undefined {
  return jobs.find((job) => job.status === JobStatus.ACCEPTED);
}

/**
 * Display order for job statuses in the dashboard
 */
export const STATUS_DISPLAY_ORDER: JobStatus[] = [
  JobStatus.ACCEPTED,
  JobStatus.OFFERED,
  JobStatus.INTERVIEWING,
  JobStatus.APPLIED,
  JobStatus.PENDING,
  JobStatus.REJECTED,
];

/**
 * Human-readable labels for job statuses
 */
export const STATUS_LABELS: Record<JobStatus, string> = {
  [JobStatus.PENDING]: 'Pending',
  [JobStatus.APPLIED]: 'Applied',
  [JobStatus.INTERVIEWING]: 'Interviewing',
  [JobStatus.OFFERED]: 'Offered',
  [JobStatus.ACCEPTED]: 'Accepted',
  [JobStatus.REJECTED]: 'Rejected',
};

/**
 * Filters jobs by search query
 * 
 * Searches across title, company, and notes fields with case-insensitive matching.
 * Returns all jobs when query is empty or whitespace-only.
 * 
 * @param jobs - Array of jobs to filter
 * @param query - Search query string
 * @returns Filtered array of jobs matching the query
 * 
 * Property 4: Search Filter Matches on Title, Company, and Notes
 * - Filtered results contain exactly the jobs where the query appears as a substring
 *   (case-insensitive) in the title, company, OR notes fields
 * - An empty query returns all jobs
 * 
 * Requirements: 2.2, 2.3, 2.4
 */
export function filterJobsBySearch(jobs: Job[], query: string): Job[] {
  const trimmedQuery = query.trim();
  
  // Return all jobs when query is empty
  if (!trimmedQuery) {
    return jobs;
  }
  
  const lowerQuery = trimmedQuery.toLowerCase();
  
  return jobs.filter((job) => {
    const titleMatch = job.title.toLowerCase().includes(lowerQuery);
    const companyMatch = job.company.toLowerCase().includes(lowerQuery);
    const notesMatch = job.notes?.toLowerCase().includes(lowerQuery) ?? false;
    
    return titleMatch || companyMatch || notesMatch;
  });
}
