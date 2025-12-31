/**
 * Accepted Job Banner Component
 * 
 * Displays a prominent banner/card for the currently accepted job offer.
 * Shows below Today's Progress on the dashboard.
 * 
 * Requirements:
 * - 4.1: Display accepted job prominently on dashboard
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { fontFamily, fontSize, spacing, borderRadius, statusColors } from '../../theme';

interface AcceptedJobBannerProps {
  job: Job;
  onPress: (jobId: string) => void;
}

export function AcceptedJobBanner({ job, onPress }: AcceptedJobBannerProps) {
  const { colors } = useTheme();
  const acceptedColor = statusColors.accepted;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: `${acceptedColor}15`, borderColor: acceptedColor }]}
      onPress={() => onPress(job.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: acceptedColor }]}>
        <Ionicons name="checkmark-circle" size={24} color="#fff" />
      </View>
      <View style={styles.content}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: acceptedColor }]}>Accepted Offer</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {job.title}
        </Text>
        <Text style={[styles.company, { color: colors.textSecondary }]} numberOfLines={1}>
          {job.company}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    marginTop: spacing.xs,
  },
  company: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
});
