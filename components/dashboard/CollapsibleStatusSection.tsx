/**
 * CollapsibleStatusSection Component
 * 
 * Modern collapsible section with glassmorphic design and smooth animations.
 * Features gradient accents, refined typography, and elegant transitions.
 */

import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Job, JobStatus } from '../../types';
import { STATUS_LABELS } from '../../features/jobs/utils/jobUtils';
import { JobCard } from './JobCard';
import { useTheme } from '../../hooks/useTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { fontFamily, fontSize, spacing, borderRadius, statusColors } from '../../theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface CollapsibleStatusSectionProps {
  status: JobStatus;
  jobs: Job[];
  isExpanded: boolean;
  onToggle: () => void;
  onJobPress: (jobId: string) => void;
}

/**
 * Modern status configuration with gradients and icons
 */
const statusConfig: Record<JobStatus, { 
  gradient: [string, string];
  gradientLight: [string, string];
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = {
  [JobStatus.PENDING]: { 
    gradient: ['#6b7280', '#4b5563'],
    gradientLight: ['#f3f4f6', '#e5e7eb'],
    icon: 'hourglass-outline',
    color: statusColors.pending,
  },
  [JobStatus.APPLIED]: { 
    gradient: ['#3b82f6', '#2563eb'],
    gradientLight: ['#eff6ff', '#dbeafe'],
    icon: 'paper-plane-outline',
    color: statusColors.applied,
  },
  [JobStatus.INTERVIEWING]: { 
    gradient: ['#f59e0b', '#d97706'],
    gradientLight: ['#fffbeb', '#fef3c7'],
    icon: 'chatbubbles-outline',
    color: statusColors.interviewing,
  },
  [JobStatus.OFFERED]: { 
    gradient: ['#10b981', '#059669'],
    gradientLight: ['#ecfdf5', '#d1fae5'],
    icon: 'gift-outline',
    color: statusColors.offered,
  },
  [JobStatus.ACCEPTED]: { 
    gradient: ['#22c55e', '#16a34a'],
    gradientLight: ['#f0fdf4', '#dcfce7'],
    icon: 'trophy-outline',
    color: statusColors.accepted,
  },
  [JobStatus.REJECTED]: { 
    gradient: ['#ef4444', '#dc2626'],
    gradientLight: ['#fef2f2', '#fee2e2'],
    icon: 'arrow-redo-outline',
    color: statusColors.rejected,
  },
};

export function CollapsibleStatusSection({
  status,
  jobs,
  isExpanded,
  onToggle,
  onJobPress,
}: CollapsibleStatusSectionProps) {
  const { colors, isDark } = useTheme();
  const { selection } = useHaptics();
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const config = statusConfig[status];
  const label = STATUS_LABELS[status];
  const count = jobs.length;

  // Animate chevron rotation
  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const handleToggle = useCallback(async () => {
    await selection();
    
    // Quick scale feedback
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.98, duration: 50, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
    
    LayoutAnimation.configureNext({
      duration: 250,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    });
    onToggle();
  }, [selection, onToggle]);

  const handleJobPress = useCallback((jobId: string) => {
    onJobPress(jobId);
  }, [onJobPress]);

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={`${label} section, ${count} jobs, ${isExpanded ? 'expanded' : 'collapsed'}`}
          accessibilityHint="Double tap to toggle section"
        >
          <View style={[
            styles.header,
            { 
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.95)',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }
          ]}>
            {/* Left gradient accent */}
            <LinearGradient
              colors={config.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradientAccent}
            />
            
            <View style={styles.headerContent}>
              {/* Left side: Icon + Label */}
              <View style={styles.headerLeft}>
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: `${config.color}15` }
                ]}>
                  <Ionicons name={config.icon} size={18} color={config.color} />
                </View>
                <View style={styles.labelContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
                  {count > 0 && (
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                      {count} {count === 1 ? 'application' : 'applications'}
                    </Text>
                  )}
                </View>
              </View>
              
              {/* Right side: Count badge + Chevron */}
              <View style={styles.headerRight}>
                <View style={[
                  styles.countBadge,
                  { backgroundColor: `${config.color}15` }
                ]}>
                  <Text style={[styles.countText, { color: config.color }]}>{count}</Text>
                </View>
                
                <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
                  <Ionicons 
                    name="chevron-forward" 
                    size={18} 
                    color={colors.textMuted} 
                  />
                </Animated.View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Content - visible when expanded */}
      {isExpanded && count > 0 && (
        <View style={styles.content}>
          {/* Connecting line */}
          <View style={[styles.connectingLine, { backgroundColor: `${config.color}30` }]} />
          
          <View style={styles.jobsContainer}>
            {jobs.map((job, index) => (
              <View key={job.id} style={styles.jobWrapper}>
                {/* Dot indicator */}
                <View style={[styles.dotIndicator, { backgroundColor: config.color }]} />
                <View style={styles.jobCardWrapper}>
                  <JobCard
                    job={job}
                    onPress={() => handleJobPress(job.id)}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Empty state */}
      {isExpanded && count === 0 && (
        <View style={[
          styles.emptyState, 
          { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          }
        ]}>
          <Ionicons name="folder-open-outline" size={24} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No {label.toLowerCase()} applications yet
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  gradientAccent: {
    width: 4,
    height: '100%',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    marginLeft: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countBadge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
  },
  content: {
    marginTop: spacing.xs,
    marginLeft: spacing.lg,
    position: 'relative',
  },
  connectingLine: {
    position: 'absolute',
    left: 6,
    top: 0,
    bottom: spacing.md,
    width: 2,
    borderRadius: 1,
  },
  jobsContainer: {
    paddingLeft: spacing.lg,
  },
  jobWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: spacing.lg,
    marginLeft: -spacing.lg + 3,
    marginRight: spacing.sm,
  },
  jobCardWrapper: {
    flex: 1,
  },
  emptyState: {
    marginTop: spacing.sm,
    marginLeft: spacing.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: spacing.xs,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
});

export default CollapsibleStatusSection;
