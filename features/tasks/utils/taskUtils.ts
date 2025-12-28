/**
 * Task Utility Functions
 * 
 * Provides utility functions for task operations including sorting.
 * 
 * Requirements:
 * - 9.1: Display tasks sorted by status (pending first) and due date
 */

import { Task, TaskStatus } from '../../../types';

/**
 * Sorts tasks by status (PENDING first) and then by due date (ascending)
 * 
 * Tasks are sorted with:
 * 1. PENDING tasks before COMPLETED tasks
 * 2. Within each status group, tasks are sorted by due date ascending
 *    (earliest due date first, null due dates at the end)
 * 
 * @param tasks - Array of tasks to sort
 * @returns New array of tasks sorted by status and due date
 * 
 * Requirements: 9.1
 * Property 17: Tasks sorted by status and due date
 */
export function sortTasksByStatusAndDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // First, sort by status: PENDING before COMPLETED
    if (a.status !== b.status) {
      if (a.status === TaskStatus.PENDING) return -1;
      if (b.status === TaskStatus.PENDING) return 1;
    }

    // Within same status, sort by due date ascending
    // Tasks with no due date go to the end
    const dueDateA = a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const dueDateB = b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    
    return dueDateA - dueDateB;
  });
}

/**
 * Sorts tasks by due date only (ascending)
 * 
 * @param tasks - Array of tasks to sort
 * @returns New array of tasks sorted by due date ascending
 */
export function sortTasksByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const dueDateA = a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const dueDateB = b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return dueDateA - dueDateB;
  });
}

/**
 * Sorts tasks by created date (descending - most recent first)
 * 
 * @param tasks - Array of tasks to sort
 * @returns New array of tasks sorted by created date descending
 */
export function sortTasksByCreatedAt(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const dateA = a.createdAt.getTime();
    const dateB = b.createdAt.getTime();
    return dateB - dateA; // Descending order
  });
}

/**
 * Sorts tasks by title alphabetically (A-Z)
 * 
 * @param tasks - Array of tasks to sort
 * @returns New array of tasks sorted by title ascending
 */
export function sortTasksByTitle(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    return a.title.localeCompare(b.title);
  });
}

/**
 * Filters tasks by status
 * 
 * @param tasks - Array of tasks to filter
 * @param status - Status to filter by
 * @returns Array of tasks with the specified status
 */
export function filterTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((task) => task.status === status);
}

/**
 * Gets pending tasks
 * 
 * @param tasks - Array of tasks
 * @returns Array of pending tasks
 */
export function getPendingTasks(tasks: Task[]): Task[] {
  return filterTasksByStatus(tasks, TaskStatus.PENDING);
}

/**
 * Gets completed tasks
 * 
 * @param tasks - Array of tasks
 * @returns Array of completed tasks
 */
export function getCompletedTasks(tasks: Task[]): Task[] {
  return filterTasksByStatus(tasks, TaskStatus.COMPLETED);
}

/**
 * Gets tasks with due dates in the past (overdue)
 * 
 * @param tasks - Array of tasks
 * @returns Array of overdue tasks (pending tasks with past due dates)
 */
export function getOverdueTasks(tasks: Task[]): Task[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return tasks.filter((task) => {
    if (task.status === TaskStatus.COMPLETED) return false;
    if (!task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate.getTime() < now.getTime();
  });
}

/**
 * Gets tasks due today
 * 
 * @param tasks - Array of tasks
 * @returns Array of tasks due today
 */
export function getTasksDueToday(tasks: Task[]): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return tasks.filter((task) => {
    if (!task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate.getTime() === today.getTime();
  });
}

/**
 * Human-readable labels for task statuses
 */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'Pending',
  [TaskStatus.COMPLETED]: 'Completed',
};
