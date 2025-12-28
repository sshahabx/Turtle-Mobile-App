// API services for JobAppTracker Mobile
// This file will export all services

// Local Database (Standalone mode - no backend required)
export * from './database';
export { db } from './database';

export {
  api,
  apiClient,
  getStoredToken,
  storeToken,
  clearToken,
  getRefreshToken,
  storeRefreshToken,
  onAuthError,
  isApiError,
  type ApiError,
} from './api/client';

// API Response Transformers
export {
  parseJobResponse,
  parseNoteResponse,
  parseTaskResponse,
  parseHabitResponse,
  parseHabitEntryResponse,
  parseJobsResponse,
  parseNotesResponse,
  parseTasksResponse,
  parseHabitsResponse,
  type JobApiResponse,
  type NoteApiResponse,
  type TaskApiResponse,
  type HabitApiResponse,
  type HabitEntryApiResponse,
} from './api/transformers';

// API Endpoints
export { ENDPOINTS } from './api/endpoints';

// Typed Service Methods
export {
  jobsService,
  notesService,
  tasksService,
  habitsService,
  userService,
  authService,
  type AuthResponse,
  type SessionResponse,
} from './api/services';

// Storage Services (Requirements 1.3, 1.6, 11.4)
export {
  // Secure storage for tokens
  storeToken as storeSecureToken,
  getToken as getSecureToken,
  clearToken as clearSecureToken,
  storeRefreshToken as storeSecureRefreshToken,
  getRefreshToken as getSecureRefreshToken,
  clearRefreshToken as clearSecureRefreshToken,
  clearAllTokens,
  hasToken,
  SECURE_STORAGE_KEYS,
  // Async storage for preferences
  storePreference,
  getPreference,
  removePreference,
  clearAllPreferences,
  getMultiplePreferences,
  storeMultiplePreferences,
  PREFERENCE_KEYS,
} from './storage';

// Query Client with offline caching (Requirements 12.1, 12.4)
export {
  queryClient,
  asyncStoragePersister,
  persistOptions,
  createQueryClient,
  createAsyncStorageQueryPersister,
} from './queryClient';

// Default export with all services
export { default as services } from './api/services';
