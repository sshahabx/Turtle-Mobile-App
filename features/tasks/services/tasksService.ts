/**
 * Tasks Service
 * 
 * Provides task-related API operations with proper typing and date parsing.
 * Wraps the core API service for use within the tasks feature.
 * 
 * Requirements:
 * - 9.1: Display tasks sorted by status and due date
 * - 9.3: Create task via API
 * - 9.4: Toggle task status between PENDING and COMPLETED
 * - 9.5: Display task details with edit and delete options
 */

import { tasksService as apiTasksService } from '../../../services/api/services';
import { Task, TaskCreateInput, TaskUpdateInput } from '../../../types';

/**
 * Tasks Service - Feature-level API for task operations
 */
export const tasksService = {
  /**
   * Fetches all tasks for the authenticated user
   * @returns Promise resolving to array of tasks with parsed dates
   */
  async getTasks(): Promise<Task[]> {
    return apiTasksService.getTasks();
  },

  /**
   * Fetches a single task by ID
   * @param id - The task ID to fetch
   * @returns Promise resolving to the task with parsed dates
   */
  async getTask(id: string): Promise<Task> {
    return apiTasksService.getTask(id);
  },

  /**
   * Creates a new task
   * @param data - The task creation input
   * @returns Promise resolving to the created task with parsed dates
   */
  async createTask(data: TaskCreateInput): Promise<Task> {
    return apiTasksService.createTask(data);
  },

  /**
   * Updates an existing task
   * @param id - The task ID to update
   * @param data - The task update input
   * @returns Promise resolving to the updated task with parsed dates
   */
  async updateTask(id: string, data: TaskUpdateInput): Promise<Task> {
    return apiTasksService.updateTask(id, data);
  },

  /**
   * Deletes a task
   * @param id - The task ID to delete
   * @returns Promise resolving when deletion is complete
   */
  async deleteTask(id: string): Promise<void> {
    return apiTasksService.deleteTask(id);
  },
};

export default tasksService;
