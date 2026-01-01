/**
 * Journey Feature Exports
 *
 * Provides access to journey-related services, hooks, and utilities
 * for the Career Journey (Forest Map) feature.
 */

// Services
export {
  pointsService,
  isValidPointAction,
  getPointValue,
  VALID_POINT_ACTIONS,
} from './services/pointsService';

export { journeyService } from './services/journeyService';

// Hooks
export { useJourneyMilestones } from './hooks/useJourneyMilestones';

// Utils
export {
  getMilestoneState,
  checkMilestoneUnlock,
  getMilestoneHint,
  isMilestoneLocked,
  getMilestoneThreshold,
  getRelevantStatForMilestone,
} from './utils/milestoneUtils';

export {
  createInitialLevel,
  completeLevel,
  validateLevelData,
  validateCompletedLevelData,
  isInitialLevel,
  getLevelTitle,
  getNextLevelNumber,
} from './utils/levelUtils';
