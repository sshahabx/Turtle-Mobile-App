/**
 * MilestoneNode Component
 *
 * Renders individual milestone markers on the journey path with distinct
 * visual states for locked, unlocked, and current milestones.
 * Implements subtle unlock animations (fade in, gentle glow).
 *
 * Requirements:
 * - 4.3: WHEN a milestone is achieved, Milestone_Node SHALL unlock with subtle animation
 * - 4.5: Milestone_Node SHALL display distinct visual state for locked, unlocked, current
 * - 9.1: Use the app's existing zinc-based neutral color palette
 * - 9.2: Avoid bright accent colors except for primary emerald theme
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, lineHeight } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { emerald, zinc } from '../../theme/colors';
import type { Milestone, MilestoneState } from '../../types/journey';

export interface MilestoneNodeProps {
  /** The milestone data */
  milestone: Milestone;
  /** Current visual state of the milestone */
  state: MilestoneState;
  /** Callback when the node is pressed */
  onPress: () => void;
  /** Whether to animate the unlock (for newly unlocked milestones) */
  animateUnlock?: boolean;
}

/**
 * Get node colors based on state and theme
 */
function getNodeColors(
  state: MilestoneState,
  isDark: boolean
): { bg: string; border: string; text: string; icon: string } {
  switch (state) {
    case 'locked':
      return {
        bg: isDark ? zinc[800] : zinc[100],
        border: isDark ? zinc[700] : zinc[300],
        text: isDark ? zinc[500] : zinc[400],
        icon: isDark ? zinc[600] : zinc[400],
      };
    case 'unlocked':
      return {
        bg: isDark ? emerald[900] : emerald[50],
        border: isDark ? emerald[700] : emerald[200],
        text: isDark ? emerald[300] : emerald[700],
        icon: isDark ? emerald[400] : emerald[600],
      };
    case 'current':
      return {
        bg: isDark ? emerald[800] : emerald[100],
        border: isDark ? emerald[500] : emerald[400],
        text: isDark ? emerald[200] : emerald[800],
        icon: isDark ? emerald[300] : emerald[600],
      };
    default:
      return {
        bg: isDark ? zinc[800] : zinc[100],
        border: isDark ? zinc[700] : zinc[300],
        text: isDark ? zinc[500] : zinc[400],
        icon: isDark ? zinc[600] : zinc[400],
      };
  }
}

/**
 * Get milestone icon based on type
 */
function getMilestoneIcon(type: string): string {
  switch (type) {
    case 'first_application':
      return '🌱';
    case 'applications_10':
      return '🌿';
    case 'applications_25':
      return '🌳';
    case 'applications_50':
      return '🏔️';
    case 'first_interview':
      return '💬';
    case 'first_offer':
      return '⭐';
    case 'accepted_offer':
      return '🎉';
    default:
      return '📍';
  }
}

export function MilestoneNode({
  milestone,
  state,
  onPress,
  animateUnlock = false,
}: MilestoneNodeProps) {
  const { isDark } = useTheme();
  const colors = getNodeColors(state, isDark);
  const icon = getMilestoneIcon(milestone.type);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(animateUnlock ? 0 : 1)).current;
  const scaleAnim = useRef(new Animated.Value(animateUnlock ? 0.8 : 1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animateUnlock && state === 'unlocked') {
      // Fade in and scale up animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Gentle glow pulse animation
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [animateUnlock, state, fadeAnim, scaleAnim, glowAnim]);

  // Interpolate glow shadow
  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.4],
  });

  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 12],
  });

  const isLocked = state === 'locked';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={false} // Allow tapping locked nodes to show hints
      accessibilityRole="button"
      accessibilityLabel={`${milestone.title} milestone, ${state}`}
      accessibilityHint={
        isLocked
          ? 'Tap to see how to unlock this milestone'
          : 'Tap to view milestone details'
      }
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Node circle with glow effect */}
        <Animated.View
          style={[
            styles.nodeCircle,
            {
              backgroundColor: colors.bg,
              borderColor: colors.border,
              shadowColor: state === 'unlocked' ? emerald[500] : 'transparent',
              shadowOpacity: shadowOpacity as unknown as number,
              shadowRadius: shadowRadius as unknown as number,
            },
          ]}
        >
          <Text style={[styles.icon, { opacity: isLocked ? 0.4 : 1 }]}>
            {isLocked ? '🔒' : icon}
          </Text>
        </Animated.View>

        {/* Title label */}
        <View style={styles.labelContainer}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
          >
            {milestone.title}
          </Text>
          {state === 'current' && (
            <View style={[styles.currentBadge, { backgroundColor: colors.border }]}>
              <Text style={[styles.currentText, { color: colors.text }]}>
                Current
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 100,
  },
  nodeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  icon: {
    fontSize: 24,
  },
  labelContainer: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.tight,
    textAlign: 'center',
  },
  currentBadge: {
    marginTop: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  currentText: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    lineHeight: 12,
  },
});

export default MilestoneNode;
