export { config, APP_ENV } from './env';
export type { AppEnvironment, Config } from './env';

export { FREE_TIER_LIMITS } from './limits';
export type { EntityLimits, EntityType, LimitStatus } from './limits';

export { 
  MILESTONE_CONFIG, 
  MILESTONE_TYPES, 
  getMilestoneDefinition, 
  shouldUnlockMilestone 
} from './milestones';

export {
  VISUAL_TIER_THRESHOLDS,
  VISUAL_TIER_ORDER,
  getVisualTier,
  getNextVisualTier,
  getPointsToNextTier,
} from './visualTiers';
