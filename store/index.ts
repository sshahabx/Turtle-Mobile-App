/**
 * Zustand stores for JobAppTracker Mobile
 *
 * This file exports all stores for centralized access.
 */

export { useAuthStore } from './authStore';
export { useUIStore, type SortBy, type ViewMode } from './uiStore';
export { useNotificationStore, MAX_NOTIFICATIONS } from './notificationStore';
export {
  useJourneyStore,
  POINT_VALUES,
  type JourneyUpdate,
  type JourneyUpdateType,
  createInitialLevel,
  createInitialMilestones,
  createInitialJourneyState,
  serializeJourneyState,
  deserializeJourneyState,
} from './journeyStore';
