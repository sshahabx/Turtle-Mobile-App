/**
 * Typed API Service Methods
 * 
 * Provides typed service functions for all API endpoints.
 * Uses the API client with interceptors and response transformers.
 * 
 * Requirements:
 * - 17.1: TypeScript interfaces matching backend response schemas
 * - 17.2: Validate response structure against expected types
 */

import api from './client';
import { ENDPOINTS } from './endpoints';
import {
  parseJobResponse,
  parseJobsResponse,
  parseNoteResponse,
  parseNotesResponse,
  parseTaskResponse,
  parseTasksResponse,
  parseHabitResponse,
  parseHabitsResponse,
  JobApiResponse,
  NoteApiResponse,
  TaskApiResponse,
  HabitApiResponse,
} from './transformers';
import {
  Job,
  JobCreateInput,
  JobUpdateInput,
  Note,
  NoteCreateInput,
  NoteUpdateInput,
  Task,
  TaskCreateInput,
  TaskUpdateInput,
  Habit,
  HabitCreateInput,
  HabitUpdateInput,
  User,
} from '../../types';

// ============================================================================
// Request Serializers (Date objects to ISO strings)
// ============================================================================

/**
 * Serializes job input for API request, converting Date objects to ISO strings
 */
function serializeJobInput(
  input: JobCreateInput | JobUpdateInput
): Record<string, unknown> {
  const serialized: Record<string, unknown> = { ...input };
  
  if (input.deadline) {
    serialized.deadline = input.deadline.toISOString();
  }
  
  if ('offerAcceptedDate' in input && input.offerAcceptedDate) {
    serialized.offerAcceptedDate = input.offerAcceptedDate.toISOString();
  }
  
  return serialized;
}

/**
 * Serializes task input for API request, converting Date objects to ISO strings
 */
function serializeTaskInput(
  input: TaskCreateInput | TaskUpdateInput
): Record<string, unknown> {
  const serialized: Record<string, unknown> = { ...input };
  
  if (input.dueDate) {
    serialized.dueDate = input.dueDate.toISOString();
  }
  
  return serialized;
}

// ============================================================================
// Jobs Service
// ============================================================================

export const jobsService = {
  /**
   * Fetches all jobs for the authenticated user
   */
  async getJobs(): Promise<Job[]> {
    const response = await api.get<JobApiResponse[]>(ENDPOINTS.JOBS.BASE);
    return parseJobsResponse(response);
  },

  /**
   * Fetches a single job by ID
   */
  async getJob(id: string): Promise<Job> {
    const response = await api.get<JobApiResponse>(ENDPOINTS.JOBS.BY_ID(id));
    return parseJobResponse(response);
  },

  /**
   * Creates a new job
   */
  async createJob(data: JobCreateInput): Promise<Job> {
    const serialized = serializeJobInput(data);
    const response = await api.post<JobApiResponse>(ENDPOINTS.JOBS.BASE, serialized);
    return parseJobResponse(response);
  },

  /**
   * Updates an existing job
   */
  async updateJob(id: string, data: JobUpdateInput): Promise<Job> {
    const serialized = serializeJobInput(data);
    const response = await api.put<JobApiResponse>(ENDPOINTS.JOBS.BY_ID(id), serialized);
    return parseJobResponse(response);
  },

  /**
   * Deletes a job
   */
  async deleteJob(id: string): Promise<void> {
    await api.delete(ENDPOINTS.JOBS.BY_ID(id));
  },
};

// ============================================================================
// Notes Service
// ============================================================================

export const notesService = {
  /**
   * Fetches all notes for the authenticated user
   */
  async getNotes(): Promise<Note[]> {
    const response = await api.get<NoteApiResponse[]>(ENDPOINTS.NOTES.BASE);
    return parseNotesResponse(response);
  },

  /**
   * Fetches a single note by ID
   */
  async getNote(id: string): Promise<Note> {
    const response = await api.get<NoteApiResponse>(ENDPOINTS.NOTES.BY_ID(id));
    return parseNoteResponse(response);
  },

  /**
   * Creates a new note
   */
  async createNote(data: NoteCreateInput): Promise<Note> {
    const response = await api.post<NoteApiResponse>(ENDPOINTS.NOTES.BASE, data);
    return parseNoteResponse(response);
  },

  /**
   * Updates an existing note
   */
  async updateNote(id: string, data: NoteUpdateInput): Promise<Note> {
    const response = await api.put<NoteApiResponse>(ENDPOINTS.NOTES.BY_ID(id), data);
    return parseNoteResponse(response);
  },

  /**
   * Deletes a note
   */
  async deleteNote(id: string): Promise<void> {
    await api.delete(ENDPOINTS.NOTES.BY_ID(id));
  },
};

// ============================================================================
// Tasks Service
// ============================================================================

export const tasksService = {
  /**
   * Fetches all tasks for the authenticated user
   */
  async getTasks(): Promise<Task[]> {
    const response = await api.get<TaskApiResponse[]>(ENDPOINTS.TASKS.BASE);
    return parseTasksResponse(response);
  },

  /**
   * Fetches a single task by ID
   */
  async getTask(id: string): Promise<Task> {
    const response = await api.get<TaskApiResponse>(ENDPOINTS.TASKS.BY_ID(id));
    return parseTaskResponse(response);
  },

  /**
   * Creates a new task
   */
  async createTask(data: TaskCreateInput): Promise<Task> {
    const serialized = serializeTaskInput(data);
    const response = await api.post<TaskApiResponse>(ENDPOINTS.TASKS.BASE, serialized);
    return parseTaskResponse(response);
  },

  /**
   * Updates an existing task
   */
  async updateTask(id: string, data: TaskUpdateInput): Promise<Task> {
    const serialized = serializeTaskInput(data);
    const response = await api.put<TaskApiResponse>(ENDPOINTS.TASKS.BY_ID(id), serialized);
    return parseTaskResponse(response);
  },

  /**
   * Deletes a task
   */
  async deleteTask(id: string): Promise<void> {
    await api.delete(ENDPOINTS.TASKS.BY_ID(id));
  },
};

// ============================================================================
// Habits Service
// ============================================================================

export const habitsService = {
  /**
   * Fetches all habits for the authenticated user
   */
  async getHabits(): Promise<Habit[]> {
    const response = await api.get<HabitApiResponse[]>(ENDPOINTS.HABITS.BASE);
    return parseHabitsResponse(response);
  },

  /**
   * Fetches a single habit by ID
   */
  async getHabit(id: string): Promise<Habit> {
    const response = await api.get<HabitApiResponse>(ENDPOINTS.HABITS.BY_ID(id));
    return parseHabitResponse(response);
  },

  /**
   * Creates a new habit
   */
  async createHabit(data: HabitCreateInput): Promise<Habit> {
    const response = await api.post<HabitApiResponse>(ENDPOINTS.HABITS.BASE, data);
    return parseHabitResponse(response);
  },

  /**
   * Updates an existing habit
   */
  async updateHabit(id: string, data: HabitUpdateInput): Promise<Habit> {
    const response = await api.put<HabitApiResponse>(ENDPOINTS.HABITS.BY_ID(id), data);
    return parseHabitResponse(response);
  },

  /**
   * Deletes a habit
   */
  async deleteHabit(id: string): Promise<void> {
    await api.delete(ENDPOINTS.HABITS.BY_ID(id));
  },

  /**
   * Marks a habit as completed for today
   */
  async completeHabit(id: string): Promise<Habit> {
    const response = await api.post<HabitApiResponse>(ENDPOINTS.HABITS.COMPLETE(id));
    return parseHabitResponse(response);
  },
};

// ============================================================================
// User Service
// ============================================================================

/** Response type for user profile */
interface UserApiResponse {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  dailyJobGoal: number;
}

/** Input type for updating daily goal */
interface UpdateGoalInput {
  dailyJobGoal: number;
}

export const userService = {
  /**
   * Fetches the current user's profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<UserApiResponse>(ENDPOINTS.USER.PROFILE);
    return response;
  },

  /**
   * Updates the user's daily job goal
   */
  async updateGoal(goal: number): Promise<User> {
    const data: UpdateGoalInput = { dailyJobGoal: goal };
    const response = await api.put<UserApiResponse>(ENDPOINTS.USER.GOAL, data);
    return response;
  },

  /**
   * Gets the user's current daily goal
   */
  async getGoal(): Promise<number> {
    const response = await api.get<{ dailyJobGoal: number }>(ENDPOINTS.USER.GOAL);
    return response.dailyJobGoal;
  },
};

// ============================================================================
// Auth Service Types
// ============================================================================

/** Response type for authentication */
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

/** Response type for session check */
export interface SessionResponse {
  user: User | null;
  isAuthenticated: boolean;
}

export const authService = {
  /**
   * Checks the current session status
   */
  async getSession(): Promise<SessionResponse> {
    const response = await api.get<SessionResponse>(ENDPOINTS.AUTH.SESSION);
    return response;
  },

  /**
   * Signs out the current user
   */
  async signOut(): Promise<void> {
    await api.post(ENDPOINTS.AUTH.SIGN_OUT);
  },

  /**
   * Refreshes the authentication token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });
    return response;
  },
};

// ============================================================================
// Export all services
// ============================================================================

export default {
  jobs: jobsService,
  notes: notesService,
  tasks: tasksService,
  habits: habitsService,
  user: userService,
  auth: authService,
};
