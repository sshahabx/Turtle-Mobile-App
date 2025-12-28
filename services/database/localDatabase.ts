/**
 * Local Database Service
 * 
 * Standalone local storage using AsyncStorage.
 * No backend API required - all data stored on device.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job, Note, Task, Habit, HabitEntry, JobStatus, TaskStatus } from '../../types';

// Storage keys
const STORAGE_KEYS = {
  JOBS: '@jobtracker:jobs',
  NOTES: '@jobtracker:notes',
  TASKS: '@jobtracker:tasks',
  HABITS: '@jobtracker:habits',
  HABIT_ENTRIES: '@jobtracker:habit_entries',
  USER_SETTINGS: '@jobtracker:user_settings',
  ONBOARDED: '@jobtracker:onboarded',
};

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// User settings type
export interface UserSettings {
  dailyJobGoal: number;
  name?: string;
  email?: string;
}

// ============ JOBS ============

export const getJobs = async (): Promise<Job[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.JOBS);
    if (!data) return [];
    const jobs = JSON.parse(data) as Job[];
    // Parse dates
    return jobs.map(job => ({
      ...job,
      createdAt: new Date(job.createdAt),
      updatedAt: new Date(job.updatedAt),
      deadline: job.deadline ? new Date(job.deadline) : undefined,
      offerAcceptedDate: job.offerAcceptedDate ? new Date(job.offerAcceptedDate) : undefined,
    }));
  } catch {
    return [];
  }
};

export const getJob = async (id: string): Promise<Job | null> => {
  const jobs = await getJobs();
  return jobs.find(job => job.id === id) || null;
};

export const createJob = async (input: {
  title: string;
  company: string;
  status?: JobStatus;
  platform?: string;
  deadline?: Date;
  notes?: string;
}): Promise<Job> => {
  const jobs = await getJobs();
  const now = new Date();
  
  const newJob: Job = {
    id: generateId(),
    title: input.title,
    company: input.company,
    status: input.status || JobStatus.PENDING,
    platform: input.platform,
    deadline: input.deadline,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
  
  jobs.push(newJob);
  await AsyncStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  return newJob;
};


export const updateJob = async (id: string, input: Partial<Job>): Promise<Job | null> => {
  const jobs = await getJobs();
  const index = jobs.findIndex(job => job.id === id);
  if (index === -1) return null;
  
  const updatedJob: Job = {
    ...jobs[index],
    ...input,
    updatedAt: new Date(),
  };
  
  jobs[index] = updatedJob;
  await AsyncStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  return updatedJob;
};

export const deleteJob = async (id: string): Promise<boolean> => {
  const jobs = await getJobs();
  const filtered = jobs.filter(job => job.id !== id);
  if (filtered.length === jobs.length) return false;
  
  await AsyncStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(filtered));
  return true;
};

// ============ NOTES ============

export const getNotes = async (): Promise<Note[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
    if (!data) return [];
    const notes = JSON.parse(data) as Note[];
    return notes.map(note => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    }));
  } catch {
    return [];
  }
};

export const getNote = async (id: string): Promise<Note | null> => {
  const notes = await getNotes();
  return notes.find(note => note.id === id) || null;
};

export const createNote = async (input: { title: string; content: string }): Promise<Note> => {
  const notes = await getNotes();
  const now = new Date();
  
  const newNote: Note = {
    id: generateId(),
    title: input.title,
    content: input.content,
    createdAt: now,
    updatedAt: now,
  };
  
  notes.push(newNote);
  await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  return newNote;
};

export const updateNote = async (id: string, input: Partial<Note>): Promise<Note | null> => {
  const notes = await getNotes();
  const index = notes.findIndex(note => note.id === id);
  if (index === -1) return null;
  
  const updatedNote: Note = {
    ...notes[index],
    ...input,
    updatedAt: new Date(),
  };
  
  notes[index] = updatedNote;
  await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  return updatedNote;
};

export const deleteNote = async (id: string): Promise<boolean> => {
  const notes = await getNotes();
  const filtered = notes.filter(note => note.id !== id);
  if (filtered.length === notes.length) return false;
  
  await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered));
  return true;
};


// ============ TASKS ============

export const getTasks = async (): Promise<Task[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    if (!data) return [];
    const tasks = JSON.parse(data) as Task[];
    return tasks.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    }));
  } catch {
    return [];
  }
};

export const getTask = async (id: string): Promise<Task | null> => {
  const tasks = await getTasks();
  return tasks.find(task => task.id === id) || null;
};

export const createTask = async (input: {
  title: string;
  description?: string;
  dueDate?: Date;
}): Promise<Task> => {
  const tasks = await getTasks();
  const now = new Date();
  
  const newTask: Task = {
    id: generateId(),
    title: input.title,
    description: input.description,
    status: TaskStatus.PENDING,
    dueDate: input.dueDate,
    createdAt: now,
    updatedAt: now,
  };
  
  tasks.push(newTask);
  await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  return newTask;
};

export const updateTask = async (id: string, input: Partial<Task>): Promise<Task | null> => {
  const tasks = await getTasks();
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return null;
  
  const updatedTask: Task = {
    ...tasks[index],
    ...input,
    updatedAt: new Date(),
  };
  
  tasks[index] = updatedTask;
  await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  return updatedTask;
};

export const deleteTask = async (id: string): Promise<boolean> => {
  const tasks = await getTasks();
  const filtered = tasks.filter(task => task.id !== id);
  if (filtered.length === tasks.length) return false;
  
  await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
  return true;
};

export const toggleTaskStatus = async (id: string): Promise<Task | null> => {
  const task = await getTask(id);
  if (!task) return null;
  
  const newStatus: TaskStatus = task.status === TaskStatus.PENDING ? TaskStatus.COMPLETED : TaskStatus.PENDING;
  return updateTask(id, { status: newStatus });
};


// ============ HABITS ============

export const getHabits = async (): Promise<Habit[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
    if (!data) return [];
    const habits = JSON.parse(data) as Habit[];
    return habits.map(habit => ({
      ...habit,
      createdAt: new Date(habit.createdAt),
      updatedAt: new Date(habit.updatedAt),
      lastCompleted: habit.lastCompleted ? new Date(habit.lastCompleted) : undefined,
    }));
  } catch {
    return [];
  }
};

export const getHabit = async (id: string): Promise<Habit | null> => {
  const habits = await getHabits();
  return habits.find(habit => habit.id === id) || null;
};

export const createHabit = async (input: {
  name: string;
  description?: string;
  targetDays?: number;
}): Promise<Habit> => {
  const habits = await getHabits();
  const now = new Date();
  
  const newHabit: Habit = {
    id: generateId(),
    name: input.name,
    description: input.description,
    targetDays: input.targetDays || 7,
    currentStreak: 0,
    bestStreak: 0,
    lastCompleted: undefined,
    createdAt: now,
    updatedAt: now,
  };
  
  habits.push(newHabit);
  await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  return newHabit;
};

export const updateHabit = async (id: string, input: Partial<Habit>): Promise<Habit | null> => {
  const habits = await getHabits();
  const index = habits.findIndex(habit => habit.id === id);
  if (index === -1) return null;
  
  const updatedHabit: Habit = {
    ...habits[index],
    ...input,
    updatedAt: new Date(),
  };
  
  habits[index] = updatedHabit;
  await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  return updatedHabit;
};

export const deleteHabit = async (id: string): Promise<boolean> => {
  const habits = await getHabits();
  const filtered = habits.filter(habit => habit.id !== id);
  if (filtered.length === habits.length) return false;
  
  await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(filtered));
  
  // Also delete habit entries
  const entries = await getHabitEntries();
  const filteredEntries = entries.filter(entry => entry.habitId !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.HABIT_ENTRIES, JSON.stringify(filteredEntries));
  
  return true;
};

// ============ HABIT ENTRIES ============

export const getHabitEntries = async (): Promise<HabitEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HABIT_ENTRIES);
    if (!data) return [];
    const entries = JSON.parse(data) as HabitEntry[];
    return entries.map(entry => ({
      ...entry,
      date: new Date(entry.date),
      createdAt: new Date(entry.createdAt),
    }));
  } catch {
    return [];
  }
};

export const completeHabit = async (habitId: string): Promise<Habit | null> => {
  const habit = await getHabit(habitId);
  if (!habit) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if already completed today
  const entries = await getHabitEntries();
  const todayEntry = entries.find(e => {
    const entryDate = new Date(e.date);
    entryDate.setHours(0, 0, 0, 0);
    return e.habitId === habitId && entryDate.getTime() === today.getTime();
  });
  
  if (todayEntry) return habit; // Already completed
  
  // Add entry
  const newEntry: HabitEntry = {
    id: generateId(),
    habitId,
    date: today,
    completed: true,
    createdAt: new Date(),
  };
  entries.push(newEntry);
  await AsyncStorage.setItem(STORAGE_KEYS.HABIT_ENTRIES, JSON.stringify(entries));
  
  // Update streak
  let newStreak = 1;
  if (habit.lastCompleted) {
    const lastDate = new Date(habit.lastCompleted);
    lastDate.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDate.getTime() === yesterday.getTime()) {
      newStreak = habit.currentStreak + 1;
    }
  }
  
  const bestStreak = Math.max(habit.bestStreak, newStreak);
  
  return updateHabit(habitId, {
    currentStreak: newStreak,
    bestStreak,
    lastCompleted: today,
  });
};


// ============ USER SETTINGS ============

export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (!data) return { dailyJobGoal: 5 };
    return JSON.parse(data);
  } catch {
    return { dailyJobGoal: 5 };
  }
};

export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
  const current = await getUserSettings();
  const updated = { ...current, ...settings };
  await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(updated));
  return updated;
};

// ============ ONBOARDING ============

export const isOnboarded = async (): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED);
    return data === 'true';
  } catch {
    return false;
  }
};

export const setOnboarded = async (value: boolean): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, value.toString());
};

// ============ STATS ============

export const getJobStats = async () => {
  const jobs = await getJobs();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayJobs = jobs.filter(job => {
    const jobDate = new Date(job.createdAt);
    jobDate.setHours(0, 0, 0, 0);
    return jobDate.getTime() === today.getTime();
  });
  
  return {
    total: jobs.length,
    todayCount: todayJobs.length,
    byStatus: {
      PENDING: jobs.filter(j => j.status === 'PENDING').length,
      APPLIED: jobs.filter(j => j.status === 'APPLIED').length,
      INTERVIEWING: jobs.filter(j => j.status === 'INTERVIEWING').length,
      OFFERED: jobs.filter(j => j.status === 'OFFERED').length,
      ACCEPTED: jobs.filter(j => j.status === 'ACCEPTED').length,
      REJECTED: jobs.filter(j => j.status === 'REJECTED').length,
    },
  };
};

// ============ CLEAR ALL DATA ============

export const clearAllData = async (): Promise<void> => {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
};

export default {
  // Jobs
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  // Notes
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  // Tasks
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  // Habits
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  getHabitEntries,
  // Settings
  getUserSettings,
  updateUserSettings,
  isOnboarded,
  setOnboarded,
  getJobStats,
  clearAllData,
};
