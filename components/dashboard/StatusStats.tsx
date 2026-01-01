/**
 * StatusStats Component
 * 
 * Compact horizontal pipeline showing all 5 statuses as icon-only indicators.
 * Clean, minimal design with counts displayed below icons.
 */

import React, { memo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius, statusColors } from '../../theme';
import { JobStatus } from '../../types';

const STATUS_CONFIG: Record<JobStatus, { 
  icon: keyof typeof Ionicons.glyphMap; 
  color: string;
}> = {
  [JobStatus.PENDING]: { 
    icon: 'hourglass-outline', 
    color: statusColors.pending,
  },
  [JobStatus.APPLIED]: { 
    icon: 'paper-plane-outline', 
    color: statusColors.applied,
  },
  [JobStatus.INTERVIEWING]: { 
    icon: 'chatbubbles-outline', 
    color: statusColors.interviewing,
  },
  [JobStatus.OFFERED]: { 
    icon: 'gift-outline', 
    color: statusColors.offered,
  },
  [JobStatus.REJECTED]: { 
    icon: 'close-circle-outline', 
    color: statusColors.rejected,
  },
  [JobStatus.ACCEPTED]: { 
    icon: 'trophy-outline', 
    color: statusColors.accepted,
  },
};

// Fixed order: Pending → Applied → Interviewing → Offered → Rejected
const PIPELINE_ORDER: JobStatus[] = [
  JobStatus.PENDING,
  JobStatus.APPLIED,
  JobStatus.INTERVIEWING,
  JobStatus.OFFERED,
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
  const { colors, isDark } = useTheme();
  const scaleAnims = useRef(PIPELINE_ORDER.map(() => new Animated.Value(0.8))).current;
  const fadeAnims = useRef(PIPELINE_ORDER.map(() => new Animated.Value(0))).current;

  // Staggered entrance animation
  useEffect(() => {
    const animations = PIPELINE_ORDER.map((_, index) => 
      Animated.parallel([
        Animated.spring(scaleAnims[index], {
          toValue: 1,
          friction: 8,
          tension: 50,
          delay: index * 60,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnims[index], {
          toValue: 1,
          duration: 300,
          delay: index * 60,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        YOUR PIPELINE
      </Text>
      <View style={[
        styles.pipelineRow,
        { 
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
        }
      ]}>
        {PIPELINE_ORDER.map((status, index) => {
          const config = STATUS_CONFIG[status];
          const count = statusCounts[status] || 0;
          const hasItems = count > 0;

          return (
            <Animated.View
              key={status}
              style={[
                styles.statusItem,
                {
                  opacity: fadeAnims[index],
                  transform: [{ scale: scaleAnims[index] }],
                }
              ]}
            >
              <TouchableOpacity
                onPress={() => onStatusPress?.(status)}
                activeOpacity={0.7}
                style={styles.touchable}
              >
                <View style={[
                  styles.iconCircle,
                  { 
                    backgroundColor: hasItems ? `${config.color}15` : 'transparent',
                    borderColor: hasItems ? config.color : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  }
                ]}>
                  <Ionicons 
                    name={hasItems ? config.icon.replace('-outline', '') as keyof typeof Ionicons.glyphMap : config.icon} 
                    size={18} 
                    color={hasItems ? config.color : colors.textMuted} 
                  />
                </View>
                <Text style={[
                  styles.countText,
                  { color: hasItems ? config.color : colors.textMuted }
                ]}>
                  {count}
                </Text>
              </TouchableOpacity>
              
              {/* Connector line between statuses */}
              {index < PIPELINE_ORDER.length - 1 && (
                <View style={[
                  styles.connector,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }
                ]} />
              )}
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: -spacing.sm,
  },
  sectionTitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  pipelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  statusItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchable: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  connector: {
    position: 'absolute',
    right: -2,
    top: '50%',
    marginTop: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default StatusStats;
