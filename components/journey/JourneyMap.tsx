/**
 * JourneyMap Component
 *
 * Renders the vertically scrollable forest path visualization with milestone
 * nodes positioned along the path. Applies visual tier environmental theming
 * and auto-scrolls to current position on load.
 *
 * Requirements:
 * - 2.1: Journey_Map SHALL render as vertically scrollable view (bottom to top)
 * - 2.2: Journey_Map SHALL display forest-themed visual path connecting nodes
 * - 2.3: Journey_Map SHALL use calm, neutral colors (zinc-based palette)
 * - 2.4: Journey_Map SHALL implement slow animations and soft transitions
 * - 2.5: WHEN Journey_Map loads, System SHALL scroll to user's current position
 * - 7.2: Visual changes SHALL include new forest area themes, clearer path visibility
 * - 7.3: Visual transitions SHALL animate slowly and smoothly
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../theme/spacing';
import { emerald, zinc } from '../../theme/colors';
import type { JourneyState, Milestone, MilestoneState } from '../../types/journey';
import { getMilestoneState } from '../../features/journey/utils/milestoneUtils';
import { MILESTONE_TYPES } from '../../config/milestones';
import MilestoneNode from './MilestoneNode';
import CareerScoreDisplay from './CareerScoreDisplay';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface JourneyMapProps {
  /** The complete journey state */
  journeyState: JourneyState;
  /** User statistics for milestone state calculation */
  stats: {
    totalApplications: number;
    totalInterviews: number;
    totalOffers: number;
    acceptedJobs: number;
  };
  /** Callback when a milestone node is pressed */
  onMilestonePress: (milestone: Milestone) => void;
}

/**
 * Get tier-specific background colors for the forest theme
 */
function getTierBackgroundColors(
  tier: string,
  isDark: boolean
): { primary: string; secondary: string; path: string } {
  switch (tier) {
    case 'seedling':
      return {
        primary: isDark ? zinc[950] : zinc[50],
        secondary: isDark ? zinc[900] : zinc[100],
        path: isDark ? zinc[800] : zinc[200],
      };
    case 'sapling':
      return {
        primary: isDark ? '#0a1f1a' : '#f0fdf4',
        secondary: isDark ? '#0d2920' : '#dcfce7',
        path: isDark ? emerald[900] : emerald[100],
      };
    case 'grove':
      return {
        primary: isDark ? '#052e16' : '#ecfdf5',
        secondary: isDark ? '#064e3b' : '#d1fae5',
        path: isDark ? emerald[800] : emerald[200],
      };
    case 'forest':
      return {
        primary: isDark ? '#022c22' : '#ecfdf5',
        secondary: isDark ? '#065f46' : '#a7f3d0',
        path: isDark ? emerald[700] : emerald[300],
      };
    default:
      return {
        primary: isDark ? zinc[950] : zinc[50],
        secondary: isDark ? zinc[900] : zinc[100],
        path: isDark ? zinc[800] : zinc[200],
      };
  }
}

/**
 * Calculate the current milestone index for auto-scroll
 */
function getCurrentMilestoneIndex(
  milestones: Milestone[],
  stats: JourneyMapProps['stats']
): number {
  // Find the last unlocked milestone
  let lastUnlockedIndex = -1;
  for (let i = 0; i < milestones.length; i++) {
    const state = getMilestoneState(milestones[i], stats);
    if (state === 'unlocked' || state === 'current') {
      lastUnlockedIndex = i;
    }
  }
  return lastUnlockedIndex;
}

export function JourneyMap({
  journeyState,
  stats,
  onMilestonePress,
}: JourneyMapProps) {
  const { isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Animation for background transition
  const bgFadeAnim = useRef(new Animated.Value(0)).current;

  const tierColors = getTierBackgroundColors(journeyState.visualTier, isDark);

  // Animate background on tier change
  useEffect(() => {
    Animated.timing(bgFadeAnim, {
      toValue: 1,
      duration: 1000, // Slow transition as per requirements
      useNativeDriver: false,
    }).start();
  }, [journeyState.visualTier, bgFadeAnim]);

  // Auto-scroll to current position on load
  useEffect(() => {
    if (contentHeight > 0 && !hasScrolled && scrollViewRef.current) {
      const currentIndex = getCurrentMilestoneIndex(journeyState.milestones, stats);
      const totalMilestones = journeyState.milestones.length;

      if (currentIndex >= 0 && totalMilestones > 0) {
        // Calculate scroll position (inverted because we render bottom to top)
        const nodeHeight = 140; // Approximate height per milestone node
        const headerHeight = 100; // Career score display height
        const targetPosition =
          contentHeight -
          headerHeight -
          (currentIndex + 1) * nodeHeight -
          200; // Extra offset for visibility

        // Delay scroll slightly to ensure layout is complete
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, targetPosition),
            animated: true,
          });
          setHasScrolled(true);
        }, 300);
      }
    }
  }, [contentHeight, hasScrolled, journeyState.milestones, stats]);

  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height);
  }, []);

  // Get milestone state for each milestone
  const getMilestoneStateForNode = useCallback(
    (milestone: Milestone): MilestoneState => {
      return getMilestoneState(milestone, stats);
    },
    [stats]
  );

  // Render milestones in reverse order (bottom to top progression)
  const reversedMilestones = [...journeyState.milestones].reverse();

  return (
    <View style={[styles.container, { backgroundColor: tierColors.primary }]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View onLayout={handleContentLayout}>
          {/* Career Score Display at top */}
          <View style={styles.scoreContainer}>
            <CareerScoreDisplay
              score={journeyState.careerScore}
              visualTier={journeyState.visualTier}
            />
          </View>

          {/* Forest Path with Milestones */}
          <View style={styles.pathContainer}>
            {/* Path line */}
            <View
              style={[
                styles.pathLine,
                { backgroundColor: tierColors.path },
              ]}
            />

            {/* Milestone nodes */}
            {reversedMilestones.map((milestone, index) => {
              const state = getMilestoneStateForNode(milestone);
              const isLeft = index % 2 === 0;

              return (
                <View
                  key={milestone.id}
                  style={[
                    styles.milestoneRow,
                    isLeft ? styles.milestoneLeft : styles.milestoneRight,
                  ]}
                >
                  {/* Path connector dot */}
                  <View
                    style={[
                      styles.pathDot,
                      {
                        backgroundColor:
                          state === 'locked'
                            ? isDark
                              ? zinc[700]
                              : zinc[300]
                            : isDark
                            ? emerald[500]
                            : emerald[400],
                      },
                      isLeft ? styles.pathDotRight : styles.pathDotLeft,
                    ]}
                  />

                  {/* Milestone node */}
                  <MilestoneNode
                    milestone={milestone}
                    state={state}
                    onPress={() => onMilestonePress(milestone)}
                    animateUnlock={false}
                  />
                </View>
              );
            })}

            {/* Start marker at bottom */}
            <View style={styles.startMarker}>
              <View
                style={[
                  styles.startDot,
                  {
                    backgroundColor: isDark ? emerald[400] : emerald[500],
                  },
                ]}
              />
            </View>
          </View>

          {/* Bottom padding for scroll */}
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
  },
  scoreContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  pathContainer: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  pathLine: {
    position: 'absolute',
    width: 4,
    top: 0,
    bottom: 0,
    left: SCREEN_WIDTH / 2 - 2,
    borderRadius: 2,
  },
  milestoneRow: {
    width: SCREEN_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    position: 'relative',
  },
  milestoneLeft: {
    justifyContent: 'flex-start',
    paddingLeft: spacing.lg,
  },
  milestoneRight: {
    justifyContent: 'flex-end',
    paddingRight: spacing.lg,
  },
  pathDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: '50%',
    marginTop: -6,
  },
  pathDotRight: {
    left: SCREEN_WIDTH / 2 - 6,
  },
  pathDotLeft: {
    left: SCREEN_WIDTH / 2 - 6,
  },
  startMarker: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  startDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  bottomPadding: {
    height: 100,
  },
});

export default JourneyMap;
