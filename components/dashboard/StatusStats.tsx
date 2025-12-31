/**
 * StatusStats Component
 * 
 * Displays job application counts by status in an engaging grid layout.
 * Only shows statuses that have applications, making the dashboard cleaner.
 */

import React, { memo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius, statusColors } from '../../theme';
import { JobStatus } from '../../types';

interface StatusCount {
  status: JobStatus;
  count: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const STATUS_CONFIG: Record<JobStatus, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  [JobStatus.ACCEPTED]: { label: 'Accepted', icon: 'checkmark-circle', color: statusColors.accepted },
  [JobStatus.OFFERED]: { label: 'Offered', icon: 'briefcase', color: statusColors.offered },
  [JobStatus.INTERVIEWING]: { label: 'Interviewing', icon: 'people', color: statusColors.interviewing },
  [JobStatus.APPLIED]: { label: 'Applied', icon: 'send', color: statusColors.applied },
  [JobStatus.PENDING]: { label: 'Pending', icon: 'time', color: statusColors.pending },
  [JobStatus.REJECTED]: { label: 'Rejected', icon: 'close-circle', color: statusColors.rejected },
};

// Priority order for display
const STATUS_PRIORITY: JobStatus[] = [
  JobStatus.ACCEPTED,
  JobStatus.OFFERED,
  JobStatus.INTERVIEWING,
  JobStatus.APPLIED,
  JobStatus.PENDING,
  JobStatus.REJECTED,
];

export interface StatusStatsProps {
  statusCounts: Record<JobStatus, number>;
  onStatusPress?: (status: JobStatus) => void;
}

export const StatusStats = memo(function StatusStats({ 
  statusCounts, 
  onStatusPress 
}: StatusStatsProps) {
  const { colors } = useTheme();
  const fadeAnims = useRef(STATUS_PRIORITY.map(() => new Animated.Value(0))).current;
  const scaleAnims = useRef(STATUS_PRIORITY.map(() => new Animated.Value(0.8))).current;

  // Filter to only show statuses with counts > 0
  const activeStatuses = STATUS_PRIORITY.filter(status => statusCounts[status] > 0);

  // Staggered entrance animation
  useEffect(() => {
    const animations = activeStatuses.map((_, index) => {
      const originalIndex = STATUS_PRIORITY.indexOf(activeStatuses[index]);
      return Animated.parallel([
        Animated.timing(fadeAnims[originalIndex], {
          toValue: 1,
          duration: 300,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims[originalIndex], {
          toValue: 1,
          friction: 8,
          tension: 40,
          delay: index * 80,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start();
  }, [activeStatuses.length]);

  if (activeStatuses.length === 0) {
    return null;
  }

  // Calculate total for percentage display
  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        YOUR PIPELINE
      </Text>
      
      <View style={styles.grid}>
        {activeStatuses.map((status, displayIndex) => {
          const config = STATUS_CONFIG[status];
          const count = statusCounts[status];
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          const originalIndex = STATUS_PRIORITY.indexOf(status);

          return (
            <Animated.View
              key={status}
              style={[
                styles.statCardWrapper,
                {
                  opacity: fadeAnims[originalIndex],
                  transform: [{ scale: scaleAnims[originalIndex] }],
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.statCard,
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => onStatusPress?.(status)}
                activeOpacity={0.7}
              >
                {/* Color accent bar */}
                <View style={[styles.accentBar, { backgroundColor: config.color }]} />
                
                {/* Content */}
                <View style={styles.cardContent}>
                  <View style={styles.topRow}>
                    <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
                      <Ionicons name={config.icon} size={18} color={config.color} />
                    </View>
                    <View style={[styles.percentBadge, { backgroundColor: `${config.color}20` }]}>
                      <Text style={[styles.percentText, { color: config.color }]}>
                        {percentage}%
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.count, { color: config.color }]}>
                    {count}
                  </Text>
                  
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {config.label}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Total summary */}
      <View style={[styles.totalContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
          Total Applications
        </Text>
        <Text style={[styles.totalCount, { color: colors.text }]}>
          {total}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  statCardWrapper: {
    width: '50%',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  statCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accentBar: {
    height: 4,
  },
  cardContent: {
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  percentText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xs,
  },
  count: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  totalCount: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
  },
});

export default StatusStats;
