/**
 * Points Service
 *
 * Provides point-related operations for the Career Journey feature.
 * Handles awarding points for valid actions and retrieving career score.
 *
 * Requirements:
 * - 6.1: Award points only for: adding a new job application, completing a daily task,
 *        and completing a habit for the day
 * - 6.2: Accumulate points into a Career_Score that persists across sessions
 */

import { PointActionType, PointAction } from '../../../types/journey';
import { useJourneyStore, POINT_VALUES } from '../../../store/journeyStore';

/**
 * Valid action types that can earn points
 */
export const VALID_POINT_ACTIONS: PointActionType[] = [
  'job_added',
  'task_completed',
  'habit_completed',
];

/**
 * Validates if an action type is allowed to earn points
 * @param actionType - The action type to validate
 * @returns true if the action type is valid for earning points
 */
export function isValidPointAction(actionType: string): actionType is PointActionType {
  return VALID_POINT_ACTIONS.includes(actionType as PointActionType);
}

/**
 * Gets the point value for a given action type
 * @param actionType - The action type
 * @returns The point value, or 0 if invalid action type
 */
export function getPointValue(actionType: PointActionType): number {
  return POINT_VALUES[actionType] ?? 0;
}

/**
 * Points Service - Feature-level API for point operations
 */
export const pointsService = {
  /**
   * Awards points for a valid action
   * Points are only awarded if the action type is one of the allowed types.
   *
   * @param actionType - The type of action that earned points
   * @returns The number of points awarded (0 if invalid action type)
   */
  awardPoints(actionType: string): number {
    // Validate action type
    if (!isValidPointAction(actionType)) {
      console.warn(`Invalid point action type: ${actionType}`);
      return 0;
    }

    const points = getPointValue(actionType);
    
    // Award points through the store
    useJourneyStore.getState().awardPoints(actionType);

    return points;
  },

  /**
   * Gets the current career score
   * @returns The current career score
   */
  getCareerScore(): number {
    return useJourneyStore.getState().getCareerScore();
  },

  /**
   * Creates a PointAction record for tracking
   * @param actionType - The type of action
   * @returns A PointAction object with timestamp
   */
  createPointAction(actionType: PointActionType): PointAction {
    return {
      type: actionType,
      points: getPointValue(actionType),
      timestamp: new Date(),
    };
  },

  /**
   * Gets the point values configuration
   * @returns Record of action types to point values
   */
  getPointValues(): Record<PointActionType, number> {
    return { ...POINT_VALUES };
  },
};

export default pointsService;
