/**
 * CollapsibleStatusSection Component
 * 
 * A collapsible section that groups job applications by status.
 * Displays a header with status name, icon, and count badge.
 * Expands/collapses on tap with smooth LayoutAnimation transitions.
 * 
 * Requirements:
 * - 1.1: Display job applications grouped by status in collapsible sections
 * - 1.2: Toggle expanded/collapsed state on tap
 * - 1.3: Display status name and count when collapsed
 * - 1.4: Display all JobCards when expanded
 * - 6.4: Use subtle animations for expand/collapse transitions
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from 'react-native';
import { Job, JobStatus } from '../../types';
import { STATUS_LABELS } from '../../features/jobs/utils/jobUtils';
import { JobCard } from './JobCard';
import { useTheme } from '../../hooks/useTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { fontFamily, fontSize, spacing, borderRadius } from '../../theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface CollapsibleStatusSectionProps {
  /** The job status this section represents */
  status: JobStatus;
  /** Array of jobs with this status */
  jobs: Job[];
  /** Whether the section is currently expanded */
  isExpanded: boolean;
  /** Callback when the section header is tapped */
  onToggle: () => void;
  /** Callback when a job card is pressed */
  onJobPress: (jobId: string) => void;
}

/**
 * Status-specific styling configuration
 * Maps each status to its background color, text color, and icon
 */
const statusConfig: Record<JobStatus, { bg: string; text: string; icon: string }> = {
  [JobStatus.PENDING]: { bg: '#f3f4f6', text: '#374151', icon: '○' },
  [JobStatus.APPLIED]: { bg: '#dbeafe', text: '#1d4ed8', icon: '→' },
  [JobStatus.INTERVIEWING]: { bg: '#fef3c7', text: '#b45309', icon: '◇' },
  [JobStatus.OFFERED]: { bg: '#dcfce7', text: '#15803d', icon: '★' },
  [JobStatus.ACCEPTED]: { bg: '#dcfce7', text: '#15803d', icon: '✓' },
  [JobStatus.REJECTED]: { bg: '#fee2e2', text: '#b91c1c', icon: '✕' },
};

export function CollapsibleStatusSection({
  status,
  jobs,
  isExpanded,
  onToggle,
  onJobPress,
}: CollapsibleStatusSectionProps) {
  const { colors } = useTheme();
  const { selection } = useHaptics();
  
  const config = statusConfig[status];
  const label = STATUS_LABELS[status];
  const count = jobs.length;

  const handleToggle = useCallback(async () => {
    await selection();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  }, [selection, onToggle]);

  const handleJobPress = useCallback((jobId: string) => {
    onJobPress(jobId);
  }, [onJobPress]);

  return (
    <View style={styles.container}>
      {/* Header - always visible */}
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.7}
        style={[styles.header, { backgroundColor: config.bg }]}
        accessibilityRole="button"
        accessibilityLabel={`${label} section, ${count} jobs, ${isExpanded ? 'expanded' : 'collapsed'}`}
        accessibilityHint="Double tap to toggle section"
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.icon, { color: config.text }]}>{config.icon}</Text>
          <Text style={[styles.label, { color: config.text }]}>{label}</Text>
        </View>
        
        <View style={styles.headerRight}>
          {/* Count badge */}
          <View style={styles.countBadge}>
            <Text style={[styles.countText, { color: config.text }]}>{count}</Text>
          </View>
          
          {/* Expand/collapse indicator */}
          <Text style={[styles.arrow, { color: config.text }]}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Content - visible when expanded */}
      {isExpanded && count > 0 && (
        <View style={styles.content}>
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={() => handleJobPress(job.id)}
            />
          ))}
        </View>
      )}

      {/* Empty state - visible when expanded but no jobs */}
      {isExpanded && count === 0 && (
        <View style={[styles.emptyState, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No {label.toLowerCase()} applications
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: fontSize.base,
    marginRight: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  countText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  arrow: {
    fontSize: fontSize.xs,
  },
  content: {
    marginTop: spacing.sm,
    paddingLeft: spacing.sm,
  },
  emptyState: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
});

export default CollapsibleStatusSection;
