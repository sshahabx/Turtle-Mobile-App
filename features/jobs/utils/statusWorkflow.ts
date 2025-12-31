/**
 * Status Workflow Utility
 * 
 * Determines navigation instructions when job status changes to OFFERED or ACCEPTED.
 * Handles the workflow logic for status-triggered forms.
 * 
 * Requirements:
 * - 3.1: Navigate to offer details when status changes to OFFERED
 * - 4.1: Navigate to offer details when status changes to ACCEPTED (no existing accepted job)
 * - 4.2: Navigate to accepted confirmation when status changes to ACCEPTED (existing accepted job)
 */

import { Job, JobStatus } from '../../../types';

/**
 * Result of status workflow determination
 */
export interface StatusWorkflowResult {
  /** Whether to navigate to the offer details modal */
  shouldNavigateToOfferDetails: boolean;
  /** Whether to navigate to the accepted confirmation modal */
  shouldNavigateToAcceptedConfirm: boolean;
  /** ID of the existing accepted job (if any) */
  existingAcceptedJobId?: string;
}

/**
 * Determines the navigation workflow based on status change
 * 
 * Property 5: Offered Status Navigation
 * - For any job status change to OFFERED, the system SHALL navigate to the offer details modal.
 * 
 * Property 9: Accepted Status Conditional Navigation
 * - For any job status change to ACCEPTED, if no other job is currently accepted,
 *   the system SHALL navigate directly to offer details; if another job is accepted,
 *   the system SHALL navigate to the confirmation modal.
 * 
 * @param newStatus - The new status being set
 * @param currentStatus - The current status of the job
 * @param jobs - All jobs in the system
 * @param currentJobId - The ID of the job being updated (to exclude from accepted check)
 * @returns StatusWorkflowResult with navigation instructions
 * 
 * Validates: Requirements 3.1, 4.1, 4.2
 */
export function determineStatusWorkflow(
  newStatus: JobStatus,
  currentStatus: JobStatus,
  jobs: Job[],
  currentJobId?: string
): StatusWorkflowResult {
  // Default result - no navigation needed
  const result: StatusWorkflowResult = {
    shouldNavigateToOfferDetails: false,
    shouldNavigateToAcceptedConfirm: false,
  };

  // Only trigger workflow when status is actually changing
  if (newStatus === currentStatus) {
    return result;
  }

  // Handle OFFERED status change
  if (newStatus === JobStatus.OFFERED) {
    result.shouldNavigateToOfferDetails = true;
    return result;
  }

  // Handle ACCEPTED status change
  if (newStatus === JobStatus.ACCEPTED) {
    // Find existing accepted job (excluding the current job being updated)
    const existingAcceptedJob = jobs.find(
      (job) => job.status === JobStatus.ACCEPTED && job.id !== currentJobId
    );

    if (existingAcceptedJob) {
      // Another job is already accepted - show confirmation modal
      result.shouldNavigateToAcceptedConfirm = true;
      result.existingAcceptedJobId = existingAcceptedJob.id;
    } else {
      // No existing accepted job - go directly to offer details
      result.shouldNavigateToOfferDetails = true;
    }

    return result;
  }

  // For all other status changes, no special workflow needed
  return result;
}

/**
 * Checks if a status change requires workflow handling
 * 
 * @param newStatus - The new status being set
 * @returns true if the status change may trigger a workflow
 */
export function requiresWorkflowHandling(newStatus: JobStatus): boolean {
  return newStatus === JobStatus.OFFERED || newStatus === JobStatus.ACCEPTED;
}
