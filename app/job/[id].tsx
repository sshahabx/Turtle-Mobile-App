/**
 * Job Detail Screen
 */

import React from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useJob } from '../../features/jobs/hooks/useJob';
import { useJobs } from '../../features/jobs/hooks/useJobs';
import { useHaptics } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { JobStatus } from '../../types';
import { formatDate } from '../../utils/date';
import { fontFamily, fontSize, spacing } from '../../theme';

export default function JobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { job, isLoading, error } = useJob(id);
  const { updateStatus, deleteJob, isDeleting } = useJobs();
  const { success, error: hapticError } = useHaptics();
  const { colors } = useTheme();

  const handleStatusChange = async (status: JobStatus) => {
    if (!id) return;
    try {
      await updateStatus({ id, status });
      await success();
    } catch (err) {
      await hapticError();
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  const handleEdit = () => {
    router.push({ pathname: '/modals/edit-job', params: { id } });
  };

  const handleDelete = () => {
    Alert.alert('Delete Job', 'Are you sure you want to delete this job application?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteJob(id!);
            await success();
            router.back();
          } catch (err) {
            await hapticError();
            Alert.alert('Error', 'Failed to delete job.');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !job) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Job not found</Text>
        <View style={styles.goBackButton}>
          <Button onPress={() => router.back()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{job.title}</Text>
          <Text style={[styles.company, { color: colors.textSecondary }]}>{job.company}</Text>
          <View style={styles.badgeContainer}>
            <StatusBadge status={job.status} />
          </View>

          {job.platform && (
            <View style={styles.infoSection}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Platform</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{job.platform}</Text>
            </View>
          )}

          {job.deadline && (
            <View style={styles.infoSection}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Deadline</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(job.deadline)}</Text>
            </View>
          )}

          {job.notes && (
            <View style={styles.infoSection}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Notes</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{job.notes}</Text>
            </View>
          )}

          <View style={styles.statusSection}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Update Status</Text>
            <View style={styles.statusButtons}>
              {Object.values(JobStatus).map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => handleStatusChange(status)}
                  style={[
                    styles.statusButton,
                    { backgroundColor: colors.backgroundTertiary },
                    job.status === status && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={[
                    styles.statusButtonText,
                    { color: colors.text },
                    job.status === status && { color: colors.textInverse },
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.buttonWrapper}>
          <Button variant="outline" onPress={handleEdit}>Edit</Button>
        </View>
        <View style={styles.buttonWrapper}>
          <Button variant="destructive" onPress={handleDelete} loading={isDeleting}>Delete</Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
  goBackButton: {
    marginTop: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
  },
  company: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    marginTop: spacing.xs,
  },
  badgeContainer: {
    marginTop: spacing.md,
  },
  infoSection: {
    marginTop: spacing.lg,
  },
  infoLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  infoValue: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    marginTop: spacing.xs,
  },
  statusSection: {
    marginTop: spacing.xl,
  },
  statusLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  statusButtonText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
});
