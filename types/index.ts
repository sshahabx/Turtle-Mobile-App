// Type definitions for JobAppTracker Mobile - Standalone Version

// ============================================================================
// Job Types
// ============================================================================

export enum JobStatus {
  PENDING = 'PENDING',
  APPLIED = 'APPLIED',
  INTERVIEWING = 'INTERVIEWING',
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface Job {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  platform?: string;
  deadline?: Date;
  notes?: string;
  offerTitle?: string;
  offerCompany?: string;
  offerSalary?: string;
  offerBenefits?: string;
  offerAcceptedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobCreateInput {
  title: string;
  company: string;
  status?: JobStatus;
  platform?: string;
  deadline?: Date;
  notes?: string;
}

export interface JobUpdateInput extends Partial<JobCreateInput> {
  offerTitle?: string;
  offerCompany?: string;
  offerSalary?: string;
  offerBenefits?: string;
  offerAcceptedDate?: Date;
}

// ============================================================================
// Note Types
// ============================================================================

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteCreateInput {
  title: string;
  content: string;
}

export interface NoteUpdateInput extends Partial<NoteCreateInput> {}

// ============================================================================
// Task Types
// ============================================================================

export enum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  dueDate?: Date;
}

export interface TaskUpdateInput extends Partial<TaskCreateInput> {
  status?: TaskStatus;
}

// ============================================================================
// Habit Types
// ============================================================================

export interface HabitEntry {
  id: string;
  habitId: string;
  date: Date;
  completed: boolean;
  createdAt: Date;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  targetDays: number;
  currentStreak: number;
  bestStreak: number;
  lastCompleted?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitCreateInput {
  name: string;
  description?: string;
  targetDays?: number;
}

export interface HabitUpdateInput extends Partial<HabitCreateInput> {}


// ============================================================================
// User Types (for compatibility)
// ============================================================================

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  dailyJobGoal: number;
}
