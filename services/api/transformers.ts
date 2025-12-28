/**
 * API Response Transformers
 * 
 * Handles transformation of API responses from raw JSON (with date strings)
 * to typed objects (with Date objects).
 * 
 * Requirements:
 * - 17.2: Validate response structure against expected types
 * - 17.4: Correctly parse date strings into Date objects
 */

import {
  Job,
  JobStatus,
  Note,
  Task,
  TaskStatus,
  Habit,
  HabitEntry,
} from '../../types';
import { parseISODate } from '../../utils/date';

// ============================================================================
// Raw API Response Types (dates as strings)
// ============================================================================

export interface JobApiResponse {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  platform: string | null;
  deadline: string | null;
  notes: string | null;
  offerTitle: string | null;
  offerCompany: string | null;
  offerSalary: string | null;
  offerBenefits: string | null;
  offerAcceptedDate: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteApiResponse {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskApiResponse {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitEntryApiResponse {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  createdAt: string;
}

export interface HabitApiResponse {
  id: string;
  name: string;
  description: string | null;
  targetDays: number;
  currentStreak: number;
  bestStreak: number;
  lastCompleted: string | null;
  userId: string;
  entries: HabitEntryApiResponse[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Response Transformers
// ============================================================================

/**
 * Parses a Job API response, converting date strings to Date objects
 * @param response - Raw API response with date strings
 * @returns Job object with Date objects
 */
export function parseJobResponse(response: JobApiResponse): Job {
  return {
    id: response.id,
    title: response.title,
    company: response.company,
    status: response.status,
    platform: response.platform,
    deadline: parseISODate(response.deadline),
    notes: response.notes,
    offerTitle: response.offerTitle,
    offerCompany: response.offerCompany,
    offerSalary: response.offerSalary,
    offerBenefits: response.offerBenefits,
    offerAcceptedDate: parseISODate(response.offerAcceptedDate),
    userId: response.userId,
    createdAt: parseISODate(response.createdAt) ?? new Date(),
    updatedAt: parseISODate(response.updatedAt) ?? new Date(),
  };
}

/**
 * Parses a Note API response, converting date strings to Date objects
 * @param response - Raw API response with date strings
 * @returns Note object with Date objects
 */
export function parseNoteResponse(response: NoteApiResponse): Note {
  return {
    id: response.id,
    title: response.title,
    content: response.content,
    userId: response.userId,
    createdAt: parseISODate(response.createdAt) ?? new Date(),
    updatedAt: parseISODate(response.updatedAt) ?? new Date(),
  };
}

/**
 * Parses a Task API response, converting date strings to Date objects
 * @param response - Raw API response with date strings
 * @returns Task object with Date objects
 */
export function parseTaskResponse(response: TaskApiResponse): Task {
  return {
    id: response.id,
    title: response.title,
    description: response.description,
    status: response.status,
    dueDate: parseISODate(response.dueDate),
    userId: response.userId,
    createdAt: parseISODate(response.createdAt) ?? new Date(),
    updatedAt: parseISODate(response.updatedAt) ?? new Date(),
  };
}

/**
 * Parses a HabitEntry API response, converting date strings to Date objects
 * @param response - Raw API response with date strings
 * @returns HabitEntry object with Date objects
 */
export function parseHabitEntryResponse(response: HabitEntryApiResponse): HabitEntry {
  return {
    id: response.id,
    habitId: response.habitId,
    date: parseISODate(response.date) ?? new Date(),
    completed: response.completed,
    createdAt: parseISODate(response.createdAt) ?? new Date(),
  };
}

/**
 * Parses a Habit API response, converting date strings to Date objects
 * @param response - Raw API response with date strings
 * @returns Habit object with Date objects
 */
export function parseHabitResponse(response: HabitApiResponse): Habit {
  return {
    id: response.id,
    name: response.name,
    description: response.description,
    targetDays: response.targetDays,
    currentStreak: response.currentStreak,
    bestStreak: response.bestStreak,
    lastCompleted: parseISODate(response.lastCompleted),
    userId: response.userId,
    entries: response.entries.map(parseHabitEntryResponse),
    createdAt: parseISODate(response.createdAt) ?? new Date(),
    updatedAt: parseISODate(response.updatedAt) ?? new Date(),
  };
}

// ============================================================================
// Array Transformers (convenience functions)
// ============================================================================

/**
 * Parses an array of Job API responses
 */
export function parseJobsResponse(responses: JobApiResponse[]): Job[] {
  return responses.map(parseJobResponse);
}

/**
 * Parses an array of Note API responses
 */
export function parseNotesResponse(responses: NoteApiResponse[]): Note[] {
  return responses.map(parseNoteResponse);
}

/**
 * Parses an array of Task API responses
 */
export function parseTasksResponse(responses: TaskApiResponse[]): Task[] {
  return responses.map(parseTaskResponse);
}

/**
 * Parses an array of Habit API responses
 */
export function parseHabitsResponse(responses: HabitApiResponse[]): Habit[] {
  return responses.map(parseHabitResponse);
}
