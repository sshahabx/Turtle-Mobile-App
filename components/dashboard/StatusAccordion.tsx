/**
 * StatusAccordion Component
 */

import React from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager, StyleSheet } from 'react-native';
import { JobStatus } from '../../types';
import { STATUS_LABELS } from '../../features/jobs/utils/jobUtils';
import { useHaptics } from '../../hooks';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface StatusAccordionProps {
  status: JobStatus;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const statusColors: Record<JobStatus, { bg: string; text: string; icon: string }> = {
  [JobStatus.PENDING]: { bg: '#f3f4f6', text: '#374151', icon: '○' },
  [JobStatus.APPLIED]: { bg: '#dbeafe', text: '#1d4ed8', icon: '→' },
  [JobStatus.INTERVIEWING]: { bg: '#fef3c7', text: '#b45309', icon: '◇' },
  [JobStatus.OFFERED]: { bg: '#dcfce7', text: '#15803d', icon: '★' },
  [JobStatus.ACCEPTED]: { bg: '#dcfce7', text: '#15803d', icon: '✓' },
  [JobStatus.REJECTED]: { bg: '#fee2e2', text: '#b91c1c', icon: '✕' },
};

export function StatusAccordion({
  status,
  count,
  isExpanded,
  onToggle,
  children,
}: StatusAccordionProps) {
  const colors = statusColors[status];
  const label = STATUS_LABELS[status];
  const { selection } = useHaptics();

  const handleToggle = async () => {
    await selection();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.7}
        style={[styles.header, { backgroundColor: colors.bg }]}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.icon, { color: colors.text }]}>{colors.icon}</Text>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={[styles.countText, { color: colors.text }]}>{count}</Text>
          </View>
          <Text style={[styles.arrow, { color: colors.text }]}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </View>
      </TouchableOpacity>

      {isExpanded && count > 0 && (
        <View style={styles.content}>{children}</View>
      )}

      {isExpanded && count === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No {label.toLowerCase()} applications</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 12,
  },
  content: {
    marginTop: 8,
    paddingLeft: 8,
  },
  emptyState: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default StatusAccordion;
